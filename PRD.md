# KorPDF - 한글 PDF 뷰어 PRD

> **Product Requirements Document**
> 작성자: 윤기상 | 버전: 1.0 | 작성일: 2026-03-07
> 기반: [EmbedPDF (embed-pdf-viewer)](https://github.com/embedpdf/embed-pdf-viewer)

---

## 1. 프로젝트 개요

### 1.1 프로젝트명 및 목적

| 항목 | 내용 |
|------|------|
| 프로젝트명 | KorPDF - 한글 PDF 뷰어 |
| 목적 | EmbedPDF 오픈소스를 기반으로 한글 UI를 갖춘 개인용 PDF 뷰어를 개발하고, 책갈피/분할/병합 등 실용 기능을 추가한다 |
| 대상 사용자 | 개인 (1인 사용) |
| 플랫폼 | 웹 브라우저 (React SPA) |
| 라이선스 | MIT (EmbedPDF 기반) |

### 1.2 핵심 가치

- **한글 UI**: 모든 메뉴, 툴팁, 메시지를 한국어로 제공
- **확장 가능 구조**: EmbedPDF의 플러그인 아키텍처를 활용하여 신규 기능을 독립 플러그인으로 추가
- **올인원 PDF 도구**: 뷰어 + 책갈피 + 분할 + 병합을 하나의 앱에서 처리

---

## 2. 기존 EmbedPDF 기능 분석

### 2.1 코어 구조

EmbedPDF는 플러그인 기반 헤드리스 아키텍처를 채택하고 있다. 코어(`@embedpdf/core`)가 엔진과 플러그인 레지스트리를 관리하고, 각 기능은 독립 NPM 패키지(`@embedpdf/plugin-*`)로 제공된다.

### 2.2 기존 제공 플러그인 목록

| 플러그인 | 패키지명 | 기능 |
|----------|----------|------|
| Loader | `@embedpdf/plugin-loader` | PDF 파일 로드 (URL/File) |
| Viewport | `@embedpdf/plugin-viewport` | 뷰포트 관리, 반응형 컨테이너 |
| Scroll | `@embedpdf/plugin-scroll` | 가상화 스크롤, 페이지 네비게이션 |
| Render | `@embedpdf/plugin-render` | 페이지 렌더링 (Canvas) |
| Tiling | `@embedpdf/plugin-tiling` | 대형 페이지 타일링 렌더 |
| Zoom | `@embedpdf/plugin-zoom` | 줌 인/아웃, 마키 줌 |
| Search | `@embedpdf/plugin-search` | 텍스트 검색, 하이라이트 |
| Pan | `@embedpdf/plugin-pan` | 드래그 패닝 |
| Rotate | `@embedpdf/plugin-rotate` | 페이지 회전 |
| Spread | `@embedpdf/plugin-spread` | 양면 보기 모드 |
| Fullscreen | `@embedpdf/plugin-fullscreen` | 전체화면 전환 |
| Export | `@embedpdf/plugin-export` | PDF 내보내기/다운로드 |
| Thumbnail | `@embedpdf/plugin-thumbnail` | 썸네일 사이드바 |
| Selection | `@embedpdf/plugin-selection` | 텍스트 선택/복사 |
| Annotation | `@embedpdf/plugin-annotation` | 하이라이트, 스티키 노트, 잉크 등 |
| Commands | `@embedpdf/plugin-commands` | 커맨드 시스템, 키보드 단축키 |
| Interaction Mgr | `@embedpdf/plugin-interaction-manager` | 입력 이벤트 조정 |
| Document Mgr | `@embedpdf/plugin-document-manager` | 다중 문서 관리 |
| Capture | `@embedpdf/plugin-capture` | 페이지 캡처/이미지 변환 |

### 2.3 유지 항목

위 모든 플러그인을 그대로 사용한다. 한글화(i18n) 레이어만 위에 추가한다.

---

## 3. 신규 기능 요구사항

### 3.1 책갈피(Bookmark) 기능

EmbedPDF에는 사용자 책갈피 기능이 없다. PDF 내장 아웃라인(TOC)과 별도로 사용자가 직접 관리하는 책갈피를 구현한다.

#### 3.1.1 기능 상세

| 항목 | 설명 |
|------|------|
| PDF 아웃라인 표시 | PDF에 내장된 북마크/아웃라인을 사이드바 트리로 표시, 클릭 시 해당 페이지로 이동 |
| 사용자 책갈피 추가 | 현재 페이지에 사용자 정의 책갈피 추가 (이름 편집 가능) |
| 책갈피 삭제/편집 | 이름 변경, 삭제, 드래그로 순서 변경 |
| 책갈피 네비게이션 | 사이드바에서 책갈피 클릭 시 해당 페이지+스크롤 위치로 이동 |
| 영속 저장 | IndexedDB에 파일별 해시 기준으로 저장 |
| 내보내기/가져오기 | JSON 형식으로 책갈피 목록 import/export |

#### 3.1.2 구현 형태

- 커스텀 플러그인: `BookmarkPluginPackage`로 구현
- 상태: `{ bookmarks: Record<string, Bookmark[]> }` (파일 해시 → 책갈피 배열)
- Hook: `useBookmarks(documentId)` → `{ bookmarks, addBookmark, removeBookmark, updateBookmark }`
- UI 컴포넌트: `<BookmarkPanel />`, `<BookmarkButton />`

### 3.2 PDF 분할(Split) 기능

열려 있는 PDF를 페이지 범위별로 분할하여 별도 PDF 파일로 저장하는 기능이다.

#### 3.2.1 기능 상세

| 항목 | 설명 |
|------|------|
| 페이지 범위 지정 | 사용자가 페이지 범위를 입력 (예: 1-5, 8, 10-15) |
| 썸네일 선택 | 썸네일 뷰에서 드래그/클릭으로 페이지 선택 |
| 분할 미리보기 | 선택한 페이지를 미리보기로 확인 후 분할 실행 |
| 파일 저장 | 브라우저에서 PDF 파일 다운로드 (pdf-lib 사용) |
| 일괄 분할 | 여러 범위를 한번에 지정하여 다중 파일 생성 |

#### 3.2.2 구현 형태

- 커스텀 플러그인: `SplitPluginPackage`
- 의존 라이브러리: `pdf-lib` (브라우저에서 PDF 생성/편집)
- Hook: `useSplit(documentId)` → `{ splitByRange, splitByBookmarks }`
- UI 컴포넌트: `<SplitDialog />` (모달)

### 3.3 PDF 병합(Merge) 기능

여러 PDF 파일을 하나로 합치는 기능이다.

#### 3.3.1 기능 상세

| 항목 | 설명 |
|------|------|
| 파일 추가 | 드래그 앤 드롭 또는 파일 선택으로 여러 PDF 추가 |
| 순서 변경 | 드래그로 파일 순서 재배치 |
| 페이지 선택 | 파일별로 포함할 페이지 범위 지정 가능 |
| 병합 실행 | 선택한 순서/범위대로 병합 후 새 PDF 다운로드 |
| 책갈피 병합 | 각 원본 파일명을 최상위 책갈피로 자동 생성 (선택) |

#### 3.3.2 구현 형태

- 커스텀 플러그인: `MergePluginPackage`
- 의존 라이브러리: `pdf-lib`
- Hook: `useMerge()` → `{ addFile, removeFile, reorder, merge }`
- UI 컴포넌트: `<MergeDialog />` (모달)

---

## 4. 시스템 아키텍처

### 4.1 전체 구조도

```
┌─────────────────────────────────────────────┐
│              KorPDF Application              │
│  ┌─────────────────────────────────────────┐│
│  │         한글 UI Layer (i18n)            ││
│  ├─────────────────────────────────────────┤│
│  │  Custom Plugins                        ││
│  │  ┌──────────┬─────────┬──────────┐     ││
│  │  │ Bookmark │  Split  │  Merge   │ ... ││
│  │  └──────────┴─────────┴──────────┘     ││
│  ├─────────────────────────────────────────┤│
│  │  EmbedPDF Plugins (기존 19개)           ││
│  ├─────────────────────────────────────────┤│
│  │  @embedpdf/core  +  PDFium Engine       ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### 4.2 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | React 18 + TypeScript |
| PDF 엔진 | @embedpdf/engines (PDFium WASM) |
| PDF 조작 | pdf-lib (분할/병합용) |
| 상태 관리 | EmbedPDF Core Store + React Context |
| UI 라이브러리 | Tailwind CSS + shadcn/ui 또는 자체 컴포넌트 |
| 빌드 도구 | Vite |
| 패키지 관리 | pnpm |
| 로컬 저장 | IndexedDB (Dexie.js) |
| i18n | react-i18next (ko 기본) |
| 테스트 | Vitest + React Testing Library |

### 4.3 디렉토리 구조

```
korpdf/
├── src/
│   ├── app/              # 앱 엔트리, 라우팅
│   ├── plugins/          # 커스텀 플러그인
│   │   ├── bookmark/     # 책갈피 플러그인
│   │   │   ├── BookmarkPlugin.ts
│   │   │   ├── BookmarkPanel.tsx
│   │   │   ├── useBookmarks.ts
│   │   │   └── types.ts
│   │   ├── split/        # 분할 플러그인
│   │   │   ├── SplitPlugin.ts
│   │   │   ├── SplitDialog.tsx
│   │   │   ├── useSplit.ts
│   │   │   └── types.ts
│   │   ├── merge/        # 병합 플러그인
│   │   │   ├── MergePlugin.ts
│   │   │   ├── MergeDialog.tsx
│   │   │   ├── useMerge.ts
│   │   │   └── types.ts
│   │   └── index.ts      # 플러그인 export
│   ├── components/       # 공통 UI 컴포넌트
│   │   ├── Toolbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── StatusBar.tsx
│   ├── i18n/             # 다국어 리소스
│   │   └── ko.json
│   ├── store/            # 로컬 저장소 (IndexedDB)
│   └── utils/
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 5. 플러그인 확장 가이드

향후 새 기능을 추가할 때 따라야 하는 표준 절차이다. EmbedPDF의 `BasePlugin` 클래스를 상속하여 플러그인을 작성한다.

### 5.1 새 플러그인 추가 절차

1. `src/plugins/<name>/` 디렉토리 생성
2. `<Name>Plugin.ts` 작성 (BasePlugin 상속, 라이프사이클 메서드 구현)
3. `types.ts`에 상태 인터페이스, capability 인터페이스 정의
4. `use<Name>.ts` Hook 작성
5. UI 컴포넌트 작성 (옵션)
6. `createPluginRegistration()`으로 plugins 배열에 등록
7. `i18n/ko.json`에 해당 플러그인 번역 키 추가

### 5.2 플러그인 인터페이스 템플릿

```typescript
// src/plugins/<name>/<Name>Plugin.ts
import { BasePlugin } from '@embedpdf/core';

export interface <Name>State {
  documents: Record<string, <Name>DocState>;
}

export class <Name>Plugin extends BasePlugin<'<name>', <Name>State> {
  static readonly id = '<name>' as const;

  protected getInitialState(): <Name>State {
    return { documents: {} };
  }

  async onDocumentLoaded(documentId: string) { /* 초기화 */ }
  async onDocumentClosed(documentId: string) { /* 정리 */ }

  provides() {
    return { /* capability 메서드 */ };
  }
}

export const <Name>PluginPackage = {
  id: <Name>Plugin.id,
  plugin: <Name>Plugin,
};
```

### 5.3 향후 추가 가능 플러그인 후보

| 플러그인 | 설명 |
|----------|------|
| PageOrganizer | 페이지 삭제, 재배치, 회전 후 저장 |
| Watermark | 텍스트/이미지 워터마크 삽입 |
| FormFiller | PDF 폼 필드 자동 입력 |
| OCR | 이미지 PDF에서 텍스트 추출 (Tesseract.js) |
| CloudSync | Google Drive/OneDrive 연동 |
| DarkMode | 다크 모드 렌더링 |
| PrintOptimizer | 인쇄 최적화 (N-up, 범위 인쇄) |

---

## 6. UI/UX 설계

### 6.1 레이아웃 구성

```
┌──────────────────────────────────────────────┐
│  [로고] KorPDF    [도구모음 바]    [설정] [?] │
├──────────┬───────────────────────────────────┤
│ 사이드바 │                                   │
│ ┌──────┐ │         PDF 뷰포트                │
│ │썸네일│ │                                   │
│ │책갈피│ │                                   │
│ │아웃  │ │                                   │
│ │라인  │ │                                   │
│ └──────┘ │                                   │
├──────────┴───────────────────────────────────┤
│  페이지: 1/50  │  확대: 100%  │  상태 메시지  │
└──────────────────────────────────────────────┘
```

### 6.2 툴바 버튼 구성

| 그룹 | 버튼 | 동작 |
|------|------|------|
| 파일 | 열기 / 닫기 | 로컬 PDF 파일 로드/해제 |
| 탐색 | 이전/다음 페이지 | 페이지 이동 |
| 보기 | 확대/축소/맞춤 | 줌 제어 |
| 보기 | 회전 / 양면 | 회전, 스프레드 모드 |
| 검색 | 텍스트 검색 | 검색 패널 열기 |
| 도구 | 분할 | SplitDialog 모달 열기 |
| 도구 | 병합 | MergeDialog 모달 열기 |
| 도구 | 주석 | Annotation 모드 진입 |
| 책갈피 | 책갈피 추가 | 현재 위치에 책갈피 생성 |

### 6.3 한글화 범위

- 모든 UI 라벨, 버튼 텍스트, 툴팁
- 에러 메시지, 확인 다이얼로그
- 단축키 도움말
- 접근성 aria-label

---

## 7. 데이터 모델

### 7.1 책갈피 저장 스키마 (IndexedDB)

```typescript
interface BookmarkEntry {
  id: string;           // UUID
  fileHash: string;     // PDF 파일 SHA-256 해시
  name: string;         // 사용자 입력 이름
  pageIndex: number;    // 0-based 페이지 인덱스
  scrollY: number;      // 페이지 내 Y 좌표 (0~1 비율)
  color: string;        // 라벨 색상
  createdAt: number;    // 타임스탬프
  sortOrder: number;    // 정렬 순서
}
```

### 7.2 분할/병합 작업 모델

```typescript
interface SplitTask {
  sourceDocId: string;
  ranges: PageRange[];  // { start: number, end: number }
  outputName: string;
}

interface MergeTask {
  files: MergeFileEntry[];
  // { file: File, pages?: PageRange[], order: number }
  outputName: string;
  addBookmarks: boolean; // 파일명→북마크 자동생성 여부
}
```

---

## 8. 개발 로드맵

### Phase 1 - 기본 뷰어 (1~2주)

- 프로젝트 세팅 (Vite + React + TS + pnpm)
- EmbedPDF 코어 + 기존 플러그인 통합
- 한글 UI 레이어 (i18n) 적용
- 기본 툴바 + 사이드바 레이아웃 구현

### Phase 2 - 책갈피 (1~2주)

- BookmarkPlugin 구현 (상태, capability, Hook)
- PDF 내장 아웃라인 표시
- 사용자 책갈피 CRUD + IndexedDB 저장
- 책갈피 사이드바 패널 UI

### Phase 3 - 분할 (1주)

- SplitPlugin 구현
- pdf-lib 통합 (페이지 추출 → 새 PDF 생성)
- SplitDialog UI (범위 입력, 썸네일 선택)

### Phase 4 - 병합 (1주)

- MergePlugin 구현
- 다중 파일 드래그앤드롭 + 순서 편집 UI
- pdf-lib로 병합 실행 + 자동 책갈피 생성

### Phase 5 - 마무리 (1주)

- 테스트 작성 (Vitest)
- 접근성(a11y) 점검
- 성능 최적화 (대용량 PDF 처리)
- 배포 설정 (Vercel 또는 GitHub Pages)

---

## 9. 비기능 요구사항

| 항목 | 기준 |
|------|------|
| 성능 | 100MB 이하 PDF 파일 3초 이내 로드 (초기 뷰포트 렌더 기준) |
| 성능 | 분할/병합 작업 시 UI 블로킹 없음 (Web Worker 활용) |
| 호환성 | Chrome, Edge, Firefox 최신 2개 버전 지원 |
| 보안 | 모든 PDF 처리를 브라우저 내에서 수행 (서버 업로드 없음) |
| 확장성 | 새 플러그인 추가 시 기존 코드 수정 없이 plugins 배열에 등록만으로 활성화 |
| 접근성 | 키보드 네비게이션, 스크린 리더 호환 |
| 저장 | 사용자 데이터(책갈피 등) IndexedDB에 영속 저장, 브라우저 초기화 시 JSON 백업/복원 |

---

## 10. 키보드 단축키

| 기능 | 단축키 | 비고 |
|------|--------|------|
| 파일 열기 | `Ctrl + O` | |
| 검색 | `Ctrl + F` | |
| 다음 페이지 | `→` / `J` | |
| 이전 페이지 | `←` / `K` | |
| 확대 | `Ctrl + =` | |
| 축소 | `Ctrl + -` | |
| 화면 맞춤 | `Ctrl + 0` | |
| 전체화면 | `F11` | |
| 책갈피 추가 | `Ctrl + D` | 현재 페이지 |
| 책갈피 패널 | `Ctrl + B` | 토글 |
| 분할 열기 | `Ctrl + Shift + S` | 모달 |
| 병합 열기 | `Ctrl + Shift + M` | 모달 |

---

## 11. 리스크 및 제약사항

| 리스크 | 대응 |
|--------|------|
| pdf-lib가 일부 암호화 PDF를 처리 못함 | 암호화 감지 시 사용자에게 안내 메시지 표시, 비밀번호 입력 UI 제공 |
| PDFium WASM 초기 로드 시간 | CDN 캐싱 + 로딩 스피너로 UX 보완 |
| 대용량 PDF(500MB+) 병합 시 메모리 | Web Worker + 스트리밍 처리, 메모리 한도 안내 |
| EmbedPDF 버전 업데이트 시 호환성 | pnpm lockfile로 버전 고정, 주기적 호환성 체크 |
| IndexedDB 브라우저 정책으로 데이터 삭제 | JSON export 기능으로 백업 안내 |

---

## 부록: 참고 리소스

- EmbedPDF 공식 문서: https://www.embedpdf.com/docs
- EmbedPDF GitHub: https://github.com/embedpdf/embed-pdf-viewer
- pdf-lib: https://pdf-lib.js.org/
- Dexie.js (IndexedDB): https://dexie.org/
- react-i18next: https://react.i18next.com/
