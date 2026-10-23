# ThreadSketch

사진을 브라우저 안에서 십자수 도안으로 미리 확인하는 정적 웹앱입니다. 서버, 계정, 외부 추적기 없이 동작하며 GitHub Pages 하위 경로에서도 사용할 수 있도록 모든 리소스 경로를 상대 경로로 작성했습니다.

## 실행

`index.html`을 정적 서버로 열어주세요.

```bash
python -m http.server 8080
```

`data/checkout.json`의 `tool_url`, `studio_url`에 대표가 Lemon Squeezy 상품 URL을 입력하면 구매 버튼이 활성화됩니다. 비어 있으면 결제 대기 상태로 남습니다.

## 현재 범위

- 반응형 랜딩 페이지와 360px 모바일 레이아웃
- 로컬 이미지 선택·미리보기, 색 수 선택, 원단 카운트·크기 계산
- 도안/원본/시뮬레이션 탭과 접근성 기본 속성
- SEO 기본 메타(title, description, Open Graph)
- 가격표, FAQ, 구매 링크 대기/활성화 분기

## 확인 필요

현재 미리보기는 제품 경험을 검증하기 위한 샘플 격자 렌더러입니다. 실제 DMC 약 450색 최근접 매칭, k-means 양자화, PDF/Pattern Keeper 호환성, 페이지 타일링·범례·실 수량 계산은 별도 Codex 작업카드가 필요합니다. 결제 상품 등록과 URL 입력도 대표 작업입니다.

이번 QA 환경에는 연결 가능한 브라우저 탭이 없어 실제 DevTools 콘솔·360px 렌더링은 자동 확인하지 못했습니다. 로컬에서 `python -m http.server 8080` 실행 후 Chrome의 360px 디바이스 모드와 콘솔을 한 번 더 확인해야 합니다.
