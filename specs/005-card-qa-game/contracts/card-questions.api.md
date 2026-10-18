# API Contract: Card Q&A Questions Endpoint

**Endpoint**: `GET /api/games/card-qa/questions`  
**Description**: Retrieves pre-seeded questions from the database filtered by language.  
**Authentication**: None required (public gameplay content).  

---

## Request

### Query Parameters

| Parameter | Type | Required | Default | Description |
|:---|:---:|:---:|:---:|:---|
| `language` | string | No | `es` | Language filter code (`es` for Spanish, `en` for English). |
| `limit` | integer | No | `50` | Maximum number of questions to return. |

### Example Request
```http
GET /api/games/card-qa/questions?language=es HTTP/1.1
Host: localhost:5000
Accept: application/json
```

---

## Response

### Success Response (200 OK)

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "text": "¿En qué ciudad nació Jesús?",
    "type": "option-selection",
    "options": [
      "A) Nazaret",
      "B) Belén",
      "C) Jerusalén",
      "D) Galilea"
    ],
    "answer": "B) Belén",
    "language": "es"
  },
  {
    "id": "e4b2d3c1-1122-3344-5566-778899aabbcc",
    "text": "¿El arca de Noé tenía tres pisos?",
    "type": "true-false",
    "options": null,
    "answer": "Verdadero (Génesis 6:16)",
    "language": "es"
  },
  {
    "id": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
    "text": "¿Quién fue el hombre más sabio del Antiguo Testamento?",
    "type": "open-question",
    "options": null,
    "answer": "El rey Salomón (1 Reyes 3:12)",
    "language": "es"
  }
]
```

---

## Error Handling & Offline Fallback Contract

- If the backend database contains no records for the requested language, returns an empty array `[]` (200 OK).
- If the backend returns a `500 Internal Server Error` or the connection fails (`net::ERR_CONNECTION_REFUSED`), the frontend `CardQaService` must intercept the error and return bundled seed questions from `card-qa-seeds.ts` so the match can proceed without interruption.
