/**
 * GOOGLE APPS SCRIPT CODE FOR "ENGLISH 9 - MISS HIEN"
 * 
 * Project ID: 1FOrI45Kkf0e7L6XyyuyHcwME5JJ6J4IRQ9tNdvIgaZC0dQ3g0qU9vQH2
 * Editor: https://script.google.com/u/0/home/projects/1FOrI45Kkf0e7L6XyyuyHcwME5JJ6J4IRQ9tNdvIgaZC0dQ3g0qU9vQH2/edit
 * 
 * HƯỚNG DẪN TRIỂN KHAI CHO GIÁO VIÊN:
 * 1. Mở link Google Apps Script trên.
 * 2. Xóa toàn bộ mã cũ trong file Code.gs và dán toàn bộ mã dưới đây.
 * 3. Bấm "Deploy" (Triển khai) > "New deployment" (Triển khai mới).
 * 4. Chọn type: "Web app" (Ứng dụng web).
 * 5. Cấu hình:
 *    - Description: English 9 Miss Hien Sync API
 *    - Execute as: Me (Tôi - email của giáo viên)
 *    - Who has access: Anyone (Bất kỳ ai) -> RẤT QUAN TRỌNG để học sinh có thể gửi điểm mà không cần đăng nhập Google.
 * 6. Bấm "Deploy", cấp quyền cho script nếu được hỏi.
 * 7. Sao chép "Web app URL" (có đuôi /exec) và dán vào GOOGLE_SCRIPT_WEB_APP_URL trong app.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `
// ============================================================================
// ENGLISH 9 - MISS HIEN: GOOGLE SHEETS SYNC BACKEND
// Sheets: STUDENTS, LEARNING_LOG, WORD_REVIEW
// ============================================================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for concurrent requests
    lock.waitLock(30000);

    var rawData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (err) {
        rawData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      rawData = e.parameter;
    }

    var action = rawData.action || 'ping';
    var responseData = { success: false, action: action };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      // If script is standalone, fallback or get default active
      var sheets = SpreadsheetApp.getSpreadsheets();
      if (sheets && sheets.length > 0) {
        ss = sheets[0];
      }
    }

    if (!ss) {
      // Create new bound spreadsheet if none exists
      ss = SpreadsheetApp.create('English 9 - Miss Hien - Database');
    }

    // Ensure all 3 sheets exist with headers
    var studentsSheet = getOrCreateSheet(ss, 'STUDENTS', [
      'Student ID', 'Họ và tên', 'Lớp', 'Ngày tạo', 'Lần đăng nhập cuối', 
      'Tiến độ %', 'XP', 'Chuỗi ngày học', 'Vocabulary Score', 'Grammar Score', 
      'Pronunciation Score', 'Listening Score', 'Vocabulary Progress', 'Grammar Progress', 
      'Pronunciation Progress', 'Listening Progress', 'Last Activity', 'Updated At'
    ]);

    var learningLogSheet = getOrCreateSheet(ss, 'LEARNING_LOG', [
      'Timestamp', 'Student ID', 'Họ và tên', 'Lớp', 'Unit', 'Skill', 
      'Exercise', 'Score', 'Correct', 'Total', 'Passed', 'XP Earned', 'Attempt'
    ]);

    var wordReviewSheet = getOrCreateSheet(ss, 'WORD_REVIEW', [
      'Student ID', 'Họ và tên', 'Unit', 'Word', 'Correct Count', 
      'Wrong Count', 'Needs Review', 'Mastered', 'Last Practised'
    ]);

    // Handle Actions
    if (action === 'ping') {
      responseData = { success: true, message: 'English 9 API is online', timestamp: new Date().toISOString() };
    } 
    else if (action === 'login') {
      responseData = handleLogin(studentsSheet, rawData);
    } 
    else if (action === 'getStudent') {
      responseData = handleGetStudent(studentsSheet, rawData);
    } 
    else if (action === 'saveProgress') {
      responseData = handleSaveProgress(studentsSheet, rawData);
    } 
    else if (action === 'saveResult') {
      responseData = handleSaveResult(studentsSheet, learningLogSheet, rawData);
    } 
    else if (action === 'saveWordReview') {
      responseData = handleSaveWordReview(wordReviewSheet, rawData);
    } 
    else {
      responseData = { success: false, error: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4B5D44').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatDate(date) {
  if (!date) date = new Date();
  return Utilities.formatDate(date, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
}

function formatDateOnly(date) {
  if (!date) date = new Date();
  return Utilities.formatDate(date, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy');
}

// 1. LOGIN ACTION
function handleLogin(sheet, data) {
  var studentId = String(data.studentId || '').trim();
  var name = String(data.name || '').trim();
  var className = String(data.className || '9A').trim();

  if (!studentId || !name) {
    return { success: false, error: 'Missing studentId or name' };
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var rowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === studentId) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }

  var nowStr = formatDate(new Date());

  if (rowIndex > 1) {
    // Existing student: UPDATE last login & updated at
    var existingName = values[rowIndex - 1][1] || name;
    var existingClass = values[rowIndex - 1][2] || className;
    var createdAt = values[rowIndex - 1][3] || nowStr;
    var overallProgress = Number(values[rowIndex - 1][5]) || 0;
    var xp = Number(values[rowIndex - 1][6]) || 0;
    var streak = Number(values[rowIndex - 1][7]) || 1;
    var vocabScore = Number(values[rowIndex - 1][8]) || 0;
    var grammarScore = Number(values[rowIndex - 1][9]) || 0;
    var pronScore = Number(values[rowIndex - 1][10]) || 0;
    var listeningScore = Number(values[rowIndex - 1][11]) || 0;
    var vocabProg = Number(values[rowIndex - 1][12]) || 0;
    var grammarProg = Number(values[rowIndex - 1][13]) || 0;
    var pronProg = Number(values[rowIndex - 1][14]) || 0;
    var listeningProg = Number(values[rowIndex - 1][15]) || 0;
    var lastActivity = values[rowIndex - 1][16] || 'Đăng nhập';

    sheet.getRange(rowIndex, 2).setValue(name); // update name if changed
    sheet.getRange(rowIndex, 5).setValue(nowStr); // Lần đăng nhập cuối
    sheet.getRange(rowIndex, 18).setValue(nowStr); // Updated At

    return {
      success: true,
      isNew: false,
      student: {
        studentId: studentId,
        name: name,
        className: existingClass,
        createdAt: createdAt,
        lastLogin: nowStr,
        overallProgress: overallProgress,
        xp: xp,
        streak: streak,
        vocabularyScore: vocabScore,
        grammarScore: grammarScore,
        pronunciationScore: pronScore,
        listeningScore: listeningScore,
        vocabularyProgress: vocabProg,
        grammarProgress: grammarProg,
        pronunciationProgress: pronProg,
        listeningProgress: listeningProg,
        lastActivity: lastActivity,
        updatedAt: nowStr
      }
    };
  } else {
    // New student: CREATE row
    var createdDate = formatDateOnly(new Date());
    var newRow = [
      studentId,        // A: Student ID
      name,             // B: Họ và tên
      className,        // C: Lớp
      createdDate,      // D: Ngày tạo
      nowStr,           // E: Lần đăng nhập cuối
      0,                // F: Tiến độ %
      0,                // G: XP
      1,                // H: Chuỗi ngày học
      0,                // I: Vocabulary Score
      0,                // J: Grammar Score
      0,                // K: Pronunciation Score
      0,                // L: Listening Score
      0,                // M: Vocabulary Progress
      0,                // N: Grammar Progress
      0,                // O: Pronunciation Progress
      0,                // P: Listening Progress
      'Bắt đầu học',    // Q: Last Activity
      nowStr            // R: Updated At
    ];

    sheet.appendRow(newRow);

    return {
      success: true,
      isNew: true,
      student: {
        studentId: studentId,
        name: name,
        className: className,
        createdAt: createdDate,
        lastLogin: nowStr,
        overallProgress: 0,
        xp: 0,
        streak: 1,
        vocabularyScore: 0,
        grammarScore: 0,
        pronunciationScore: 0,
        listeningScore: 0,
        vocabularyProgress: 0,
        grammarProgress: 0,
        pronunciationProgress: 0,
        listeningProgress: 0,
        lastActivity: 'Bắt đầu học',
        updatedAt: nowStr
      }
    };
  }
}

// 2. GET STUDENT ACTION
function handleGetStudent(sheet, data) {
  var studentId = String(data.studentId || '').trim();
  if (!studentId) return { success: false, error: 'Missing studentId' };

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === studentId) {
      return {
        success: true,
        student: {
          studentId: studentId,
          name: values[i][1],
          className: values[i][2],
          createdAt: values[i][3],
          lastLogin: values[i][4],
          overallProgress: Number(values[i][5]) || 0,
          xp: Number(values[i][6]) || 0,
          streak: Number(values[i][7]) || 1,
          vocabularyScore: Number(values[i][8]) || 0,
          grammarScore: Number(values[i][9]) || 0,
          pronunciationScore: Number(values[i][10]) || 0,
          listeningScore: Number(values[i][11]) || 0,
          vocabularyProgress: Number(values[i][12]) || 0,
          grammarProgress: Number(values[i][13]) || 0,
          pronunciationProgress: Number(values[i][14]) || 0,
          listeningProgress: Number(values[i][15]) || 0,
          lastActivity: values[i][16] || '',
          updatedAt: values[i][17] || ''
        }
      };
    }
  }

  return { success: false, error: 'Student not found' };
}

// 3. SAVE PROGRESS ACTION
function handleSaveProgress(sheet, data) {
  var studentId = String(data.studentId || '').trim();
  if (!studentId) return { success: false, error: 'Missing studentId' };

  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === studentId) {
      rowIndex = i + 1;
      break;
    }
  }

  var nowStr = formatDate(new Date());

  if (rowIndex > 1) {
    if (data.name) sheet.getRange(rowIndex, 2).setValue(data.name);
    if (data.className) sheet.getRange(rowIndex, 3).setValue(data.className);
    if (data.overallProgress !== undefined) sheet.getRange(rowIndex, 6).setValue(data.overallProgress);
    if (data.xp !== undefined) sheet.getRange(rowIndex, 7).setValue(data.xp);
    if (data.streak !== undefined) sheet.getRange(rowIndex, 8).setValue(data.streak);
    if (data.vocabularyScore !== undefined) sheet.getRange(rowIndex, 9).setValue(data.vocabularyScore);
    if (data.grammarScore !== undefined) sheet.getRange(rowIndex, 10).setValue(data.grammarScore);
    if (data.pronunciationScore !== undefined) sheet.getRange(rowIndex, 11).setValue(data.pronunciationScore);
    if (data.listeningScore !== undefined) sheet.getRange(rowIndex, 12).setValue(data.listeningScore);
    if (data.vocabularyProgress !== undefined) sheet.getRange(rowIndex, 13).setValue(data.vocabularyProgress);
    if (data.grammarProgress !== undefined) sheet.getRange(rowIndex, 14).setValue(data.grammarProgress);
    if (data.pronunciationProgress !== undefined) sheet.getRange(rowIndex, 15).setValue(data.pronunciationProgress);
    if (data.listeningProgress !== undefined) sheet.getRange(rowIndex, 16).setValue(data.listeningProgress);
    if (data.lastActivity) sheet.getRange(rowIndex, 17).setValue(data.lastActivity);
    sheet.getRange(rowIndex, 18).setValue(nowStr);

    return { success: true, message: 'Progress updated', updatedAt: nowStr };
  } else {
    // Create new row
    var createdDate = formatDateOnly(new Date());
    var newRow = [
      studentId,
      data.name || 'Học sinh',
      data.className || '9A',
      createdDate,
      nowStr,
      data.overallProgress || 0,
      data.xp || 0,
      data.streak || 1,
      data.vocabularyScore || 0,
      data.grammarScore || 0,
      data.pronunciationScore || 0,
      data.listeningScore || 0,
      data.vocabularyProgress || 0,
      data.grammarProgress || 0,
      data.pronunciationProgress || 0,
      data.listeningProgress || 0,
      data.lastActivity || 'Lưu tiến độ',
      nowStr
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Student created and progress saved', updatedAt: nowStr };
  }
}

// 4. SAVE RESULT ACTION (LEARNING LOG)
function handleSaveResult(studentsSheet, logSheet, data) {
  var studentId = String(data.studentId || '').trim();
  var name = String(data.name || '').trim();
  var className = String(data.className || '9A').trim();
  var unit = data.unit ? ('Unit ' + data.unit) : 'General';
  var skill = data.skill || 'Practice';
  var exercise = data.exercise || 'Quiz';
  var score = Number(data.score) || 0;
  var correct = Number(data.correct) || 0;
  var total = Number(data.total) || 0;
  var passed = data.passed === true || String(data.passed).toUpperCase() === 'TRUE';
  var xpEarned = Number(data.xpEarned) || 0;
  var attempt = Number(data.attempt) || 1;

  var nowStr = formatDate(new Date());

  // 1. Append to LEARNING_LOG
  var logRow = [
    nowStr,
    studentId,
    name,
    className,
    unit,
    skill,
    exercise,
    score,
    correct,
    total,
    passed ? 'TRUE' : 'FALSE',
    xpEarned,
    attempt
  ];
  logSheet.appendRow(logRow);

  // 2. Also update STUDENTS sheet summary if student exists
  if (studentId) {
    var values = studentsSheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim() === studentId) {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex > 1) {
      if (xpEarned > 0) {
        var currentXP = Number(values[rowIndex - 1][6]) || 0;
        studentsSheet.getRange(rowIndex, 7).setValue(currentXP + xpEarned);
      }
      studentsSheet.getRange(rowIndex, 17).setValue(skill + ' ' + unit + ' - ' + exercise);
      studentsSheet.getRange(rowIndex, 18).setValue(nowStr);
    }
  }

  return { success: true, message: 'Result logged', timestamp: nowStr };
}

// 5. SAVE WORD REVIEW ACTION
function handleSaveWordReview(sheet, data) {
  var studentId = String(data.studentId || '').trim();
  var name = String(data.name || '').trim();
  var unit = Number(data.unit) || 1;
  var word = String(data.word || '').trim();
  var correctCount = Number(data.correctCount) || 0;
  var wrongCount = Number(data.wrongCount) || 0;
  var needsReview = data.needsReview === true || String(data.needsReview).toUpperCase() === 'TRUE';
  var mastered = data.mastered === true || String(data.mastered).toUpperCase() === 'TRUE';
  var lastPractised = formatDate(new Date());

  if (!studentId || !word) {
    return { success: false, error: 'Missing studentId or word' };
  }

  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    var rowStudentId = String(values[i][0]).trim();
    var rowUnit = Number(values[i][2]);
    var rowWord = String(values[i][3]).trim().toLowerCase();

    if (rowStudentId === studentId && rowUnit === unit && rowWord === word.toLowerCase()) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex > 1) {
    // UPDATE existing word record
    sheet.getRange(rowIndex, 2).setValue(name);
    sheet.getRange(rowIndex, 5).setValue(correctCount);
    sheet.getRange(rowIndex, 6).setValue(wrongCount);
    sheet.getRange(rowIndex, 7).setValue(needsReview ? 'TRUE' : 'FALSE');
    sheet.getRange(rowIndex, 8).setValue(mastered ? 'TRUE' : 'FALSE');
    sheet.getRange(rowIndex, 9).setValue(lastPractised);
    return { success: true, message: 'Word review updated' };
  } else {
    // CREATE new row
    var newRow = [
      studentId,
      name,
      unit,
      word,
      correctCount,
      wrongCount,
      needsReview ? 'TRUE' : 'FALSE',
      mastered ? 'TRUE' : 'FALSE',
      lastPractised
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Word review created' };
  }
}
`;
