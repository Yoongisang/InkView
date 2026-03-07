# InkView - Claude Development Context

## Project Overview
InkView는 EmbedPDF 오픈소스를 기반으로 한글 UI를 갖춘 개인용 PDF 뷰어입니다.
뷰어 + 책갈피 + PDF 분할 + PDF 병합을 하나의 웹앱에서 처리합니다.

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite 7 + pnpm
- **PDF Engine**: @embedpdf/core + @embedpdf/pdfium (PDFium WASM)
- **PDF Manipulation**: pdf-lib (split/merge)
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **i18n**: react-i18next (Korean default)
- **Local Storage**: Dexie.js (IndexedDB wrapper)
- **Testing**: Vitest + React Testing Library

## Architecture
- EmbedPDF 플러그인 아키텍처 기반
- 기존 @embedpdf/plugin-* 패키지를 npm에서 가져와 사용
- 커스텀 플러그인 (bookmark, split, merge)은 src/plugins/에 위치
- 각 커스텀 플러그인은 EmbedPDF의 BasePlugin 패턴을 따름:
  - manifest.ts, actions.ts, reducer.ts, types.ts, *-plugin.ts
  - React Hook (use*.ts) + UI 컴포넌트

## Key Directories
- `src/viewer/` - EmbedPDF 코어 설정 및 플러그인 등록
- `src/plugins/` - 커스텀 플러그인 (bookmark, split, merge)
- `src/components/` - 공통 UI 컴포넌트
- `src/i18n/` - 다국어 리소스 (ko.json 기본)
- `src/store/` - IndexedDB 스키마 (Dexie.js)

## Commands
- `pnpm dev` - 개발 서버 시작
- `pnpm build` - 프로덕션 빌드
- `pnpm test` - 테스트 실행
- `pnpm lint` - ESLint 실행

## EmbedPDF Plugin Pattern
커스텀 플러그인을 만들 때 이 패턴을 따릅니다:
```typescript
// manifest.ts - 플러그인 메타데이터
// actions.ts - Redux-style 액션 정의
// reducer.ts - 상태 리듀서
// types.ts - 타입 인터페이스
// *-plugin.ts - BasePlugin 상속 클래스
// use*.ts - React Hook
// *.tsx - UI 컴포넌트
```

## Conventions
- 모든 UI 텍스트는 i18n 키를 통해 처리 (하드코딩 금지)
- 파일명은 kebab-case (bookmark-plugin.ts)
- 컴포넌트명은 PascalCase (BookmarkPanel.tsx)
- Hook명은 camelCase with use prefix (useBookmarks.ts)
