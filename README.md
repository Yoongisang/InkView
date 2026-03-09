# InkView

빠르고 깔끔한 PDF 뷰어. 웹과 데스크탑(Windows) 모두 지원합니다.

**웹 앱 → [ink-view.vercel.app](https://ink-view.vercel.app/)**

---

## 주요 기능

- **멀티탭** — 여러 PDF를 탭으로 동시에 열기
- **검색** — 문서 내 텍스트 검색
- **책갈피** — 페이지 저장 및 이동
- **목차** — 문서 목차(TOC) 탐색
- **썸네일** — 페이지 미리보기
- **페이지 이동 / 확대·축소 / 회전 / 전체화면**
- **PDF 분할·병합** — pdf-lib 기반
- **파일 연결** — Windows에서 기본 PDF 뷰어로 설정 가능

---

## 사용법

### 웹 앱

브라우저에서 [ink-view.vercel.app](https://ink-view.vercel.app/) 접속 후 PDF 파일을 열거나 드래그&드롭합니다.

### 데스크탑 앱 (Windows)

1. 아래 [빌드](#빌드) 방법으로 `release\InkView Setup x.x.x.exe`를 생성합니다.
2. 설치 파일을 실행하면 설치 경로를 선택하는 마법사가 나타납니다.
3. 설치 완료 후 시작 메뉴 또는 바탕화면 바로가기로 실행합니다.

> **기본 PDF 뷰어로 설정**: PDF 파일 우클릭 → **연결 프로그램 → InkView** 선택 후 **항상 이 앱 사용** 체크

### 단축키

| 단축키 | 기능 |
|---|---|
| `Ctrl + O` | 파일 열기 |
| `Ctrl + F` | 검색 |
| `Ctrl + 휠` | 확대 / 축소 |
| `←` / `→` | 이전 / 다음 페이지 |
| `F11` | 전체화면 |

---

## 개발 환경 설정

### 요구사항

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)

### 설치

```bash
git clone https://github.com/your-username/inkview.git
cd inkview
pnpm install
```

### 개발 서버 실행

```bash
# 웹 앱 (브라우저)
pnpm dev

# 데스크탑 앱 (Electron)
pnpm electron:dev
```

### 빌드

```bash
# 웹 앱 빌드
pnpm build

# 데스크탑 앱 패키징 (Windows .exe)
pnpm electron:build
```

---

## 기술 스택

| 분류 | 라이브러리 |
|---|---|
| UI | React 18 + TypeScript + Tailwind CSS v4 |
| PDF 렌더링 | [EmbedPDF](https://embedpdf.com/) (PDFium WASM) |
| PDF 편집 | [pdf-lib](https://pdf-lib.js.org/) |
| 데스크탑 | [Electron](https://www.electronjs.org/) |
| 빌드 | [Vite](https://vite.dev/) |
| 데이터 저장 | [Dexie](https://dexie.org/) (IndexedDB) |
| 국제화 | [i18next](https://www.i18next.com/) |

---

## 라이선스

MIT
