# Quizee Analytics APIs - Complete Reference

## Overview
This document outlines all the available APIs for fetching quizee analytics data, including quizzes, battles, daily challenges, badges, and topic strength.

---

## Authenticated User Endpoints (for Institution Members)

### 1. Quiz Statistics & Topic Strength
**Endpoint:** `GET /api/user/quiz-stats`
**Authentication:** Required (Authenticated User)
**Rate Limiting:** Cached for 5 minutes

**Response Shape:**
```json
{
  "ok": true,
  "total_attempts": 45,
  "average_score": 76.5,
  "total_time_seconds": 45000,
  "avg_quiz_time": 1000,
  "fastest_quiz_time": 450,
  "avg_question_time": 25.5,
  "points_today": 150,
  "current_streak": 5,
  "total_points": 2500,
  "topic_strength": [
    {
      "name": "Algebra",
      "accuracy": 85,
      "total_questions": 24
    },
    {
      "name": "Geometry", 
      "accuracy": 72,
      "total_questions": 18
    }
  ]
}
```

**Key Features:**
- Total attempts count
- Average score percentage
- Time analytics (total, average, fastest)
- Average time per question
- Points earned today
- Current and lifetime points
- Current streak count
- **Topic Strength**: Array of topics with accuracy percentage and question count
- Sorted by accuracy (highest first)

---

### 2. User Badges & Achievements
**Endpoint:** `GET /api/user/badges?per_page=6`
**Authentication:** Required
**Query Parameters:**
- `per_page`: Items per page (default: 6)

**Response Shape:**
```json
{
  "ok": true,
  "badges": [
    {
      "id": 1,
      "title": "First Quiz",
      "description": "Complete your first quiz",
      "earned_at": "2024-12-10T14:30:00Z"
    },
    {
      "id": 2,
      "title": "Quiz Master",
      "description": "Complete 50 quizzes",
      "earned_at": "2024-12-12T09:15:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "per_page": 6
  }
}
```

**Key Fields:**
- `id`: Badge identifier
- `title`: Badge name
- `description`: Badge description
- `earned_at`: ISO 8601 timestamp when earned

---

### 3. Daily Challenges History
**Endpoint:** `GET /api/user/daily-challenges`
**Authentication:** Required
**Response Limit:** Latest 100 submissions

**Response Shape:**
```json
{
  "data": [
    {
      "id": 42,
      "completed_at": "2024-12-13T10:45:00.000000Z",
      "score": 5,
      "cache_id": 789,
      "date": "2024-12-13"
    },
    {
      "id": 41,
      "completed_at": "2024-12-12T09:20:00.000000Z",
      "score": 4,
      "cache_id": 788,
      "date": "2024-12-12"
    }
  ]
}
```

**Key Fields:**
- `id`: Daily challenge submission ID
- `completed_at`: ISO 8601 timestamp
- `score`: Points earned (typically out of 5)
- `cache_id`: Reference to daily challenge cache
- `date`: Date of the challenge (YYYY-MM-DD)

---

### 4. Daily Challenge Submission Details
**Endpoint:** `GET /api/daily-challenge-submissions/{submission_id}`
**Authentication:** Required
**Authorization:** User must own the submission

**Response Shape:**
```json
{
  "submission": {
    "id": 42,
    "cache_id": 789,
    "score": 5,
    "time_taken": 180,
    "completed_at": "2024-12-13T10:45:00Z"
  },
  "results": [
    {
      "question_id": 101,
      "question_text": "What is 2+2?",
      "question_type": "MCQ",
      "options": ["3", "4", "5", "6"],
      "user_answer": "4",
      "correct_answers": ["4"],
      "is_correct": true,
      "explanation": "2+2 equals 4"
    }
  ],
  "cache_date": "2024-12-13"
}
```

---

### 5. Quiz Attempts List
**Endpoint:** `GET /api/quiz-attempts?per_page=10&page=1`
**Authentication:** Required
**Query Parameters:**
- `per_page`: Items per page
- `page`: Page number
- `user_id`: Filter by user (optional)

**Response Shape:**
```json
{
  "data": [
    {
      "id": 1001,
      "quiz_id": 50,
      "user_id": 99,
      "score": 85,
      "correct": 17,
      "incorrect": 3,
      "skipped": 0,
      "points_earned": 170,
      "total_time_seconds": 600,
      "started_at": "2024-12-13T10:00:00Z",
      "submitted_at": "2024-12-13T10:10:00Z",
      "created_at": "2024-12-13T10:10:00Z",
      "quiz": {
        "id": 50,
        "title": "Algebra Basics",
        "description": "Test your algebra knowledge"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 45
  }
}
```

**Key Fields:**
- `id`: Attempt ID
- `quiz_id`: Referenced quiz
- `score`: Percentage score
- `correct` / `incorrect` / `skipped`: Question counts
- `points_earned`: Total points for this attempt
- `total_time_seconds`: Time spent
- `started_at` / `submitted_at`: Timestamps
- `quiz`: Nested quiz object with title/description

---

### 6. User Battles
**Endpoint:** `GET /api/me/battles`
**Authentication:** Required
**Response Limit:** Latest 15 battles

**Response Shape:**
```json
[
  {
    "id": 201,
    "initiator_id": 99,
    "opponent_id": 100,
    "quiz_id": 55,
    "status": "completed",
    "initiator_score": 85,
    "opponent_score": 72,
    "winner_id": 99,
    "initiated_at": "2024-12-13T08:00:00Z",
    "started_at": "2024-12-13T08:05:00Z",
    "completed_at": "2024-12-13T08:15:00Z",
    "initiator": {
      "id": 99,
      "first_name": "John",
      "profile": { /* profile data */ }
    },
    "opponent": {
      "id": 100,
      "first_name": "Jane",
      "profile": { /* profile data */ }
    }
  }
]
```

**Key Fields:**
- `id`: Battle ID
- `initiator_id` / `opponent_id`: Player IDs
- `status`: "pending", "in_progress", "completed", "forfeited"
- `initiator_score` / `opponent_score`: Points in battle
- `winner_id`: ID of winning player (null if draw)
- Timestamps: initiated_at, started_at, completed_at
- `initiator` / `opponent`: Nested user objects

---

## Institution-Scoped Endpoints

### 7. Member Analytics (Institution-Specific)
**Endpoint:** `GET /api/institutions/{institution_slug}/analytics/member/{user_id}`
**Authentication:** Required
**Authorization:** Institution manager only

**Response Shape:**
```json
{
  "ok": true,
  "member": {
    "id": 99,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "quizee",
    "status": "active",
    "member_since": "2024-10-01",
    "days_as_member": 73,
    "activity": {
      "total_attempts": 45,
      "avg_score": 76.50,
      "last_activity": "2024-12-13T10:45:00Z"
    }
  }
}
```

---

## API Usage Strategy for Institution Dashboard

### Data Fetching Sequence:
1. **Fetch Institution Members** → Get member ID
2. **Fetch Member Analytics** → Get basic stats
3. **For Authenticated Context** (if viewing own profile):
   - Fetch `/api/user/quiz-stats` → Topic strength, streaks
   - Fetch `/api/user/badges` → Achievements
   - Fetch `/api/user/daily-challenges` → Daily challenge history
   - Fetch `/api/me/battles` → Battle history
   - Fetch `/api/quiz-attempts` → Recent quiz attempts

### Important Notes:
- All authenticated endpoints require valid session/token
- Institution endpoints require institution-manager role
- Daily challenges limited to 100 entries
- Badges paginated (default 6 per page)
- Battles limited to 15 latest
- All timestamps in ISO 8601 format (UTC)

---

## Error Responses

### Common Error Cases:
```json
{
  "ok": false,
  "message": "Error description"
}
```

- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User lacks required permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Already submitted for today (daily challenges)

