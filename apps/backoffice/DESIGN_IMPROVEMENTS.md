# 디자인 개선 가이드

## 개요

Crypto Exchange Backoffice 프로젝트의 전반적인 디자인을 현대적이고 사용자 친화적으로 개선했습니다.

## 주요 개선 사항

### 1. 통합된 테마 시스템

#### 디자인 토큰 (`src/shared/theme/design-tokens.ts`)
- **색상 팔레트**: Primary, Secondary, Success, Warning, Error, Neutral 색상 체계
- **타이포그래피**: Inter 폰트 기반의 일관된 폰트 시스템
- **간격 시스템**: 8px 그리드 기반의 일관된 간격
- **보더 반경**: 일관된 둥근 모서리 시스템
- **그림자**: 계층적 그림자 시스템
- **애니메이션**: 일관된 애니메이션 타이밍과 이징

#### 테마 프로바이더 (`src/shared/theme/theme-provider.tsx`)
- Ant Design과 통합된 테마 시스템
- 라이트/다크 모드 지원
- 동적 테마 토글 기능

### 2. 개선된 레이아웃 컴포넌트

#### AppLayout 개선
- **헤더**: 알림, 테마 토글, 사용자 메뉴 추가
- **사이드바**: 접기/펼치기 기능, 배지 표시
- **반응형**: 모바일 친화적 레이아웃
- **접근성**: 키보드 네비게이션 지원

#### TopNavigation 개선
- **배지 시스템**: 새로운 알림 표시
- **시각적 피드백**: 호버 효과 및 애니메이션

### 3. 재사용 가능한 컴포넌트 라이브러리

#### UI 컴포넌트 (`src/shared/components/ui/`)
- **PageHeader**: 페이지 헤더 컴포넌트
- **StatsCard**: 통계 카드 컴포넌트
- **DataTable**: 고급 데이터 테이블 컴포넌트
- **StatusTag**: 상태 표시 태그 컴포넌트

#### 접근성 컴포넌트 (`src/shared/components/accessibility/`)
- **SkipLink**: 키보드 사용자를 위한 스킵 링크
- **Announcer**: 스크린 리더를 위한 공지 컴포넌트

### 4. 유틸리티 훅

#### 성능 최적화 훅
- **useDebounce**: 디바운스 기능
- **useLocalStorage**: 로컬 스토리지 관리
- **useMediaQuery**: 반응형 미디어 쿼리

#### 접근성 훅
- **useAnnouncer**: 스크린 리더 공지
- **useKeyboardNavigation**: 키보드 네비게이션

### 5. 시각적 개선

#### 글로벌 스타일 (`src/index.css`)
- **Inter 폰트**: 현대적인 타이포그래피
- **커스텀 스크롤바**: 브랜드에 맞는 스크롤바
- **애니메이션**: 부드러운 전환 효과
- **반응형**: 모바일 최적화

#### 컴포넌트 스타일링
- **그라데이션**: 현대적인 그라데이션 효과
- **그림자**: 계층적 그림자 시스템
- **호버 효과**: 인터랙티브한 사용자 경험

### 6. 성능 최적화

#### Vite 설정 개선
- **코드 스플리팅**: 라이브러리별 청크 분할
- **트리 셰이킹**: 사용하지 않는 코드 제거
- **압축**: Terser를 통한 코드 압축
- **에셋 최적화**: 이미지, 폰트 최적화

#### 번들 최적화
- **수동 청크**: 라이브러리별 청크 분할
- **에셋 분류**: 타입별 에셋 분류
- **압축 설정**: 다중 패스 압축

### 7. 접근성 개선

#### WCAG 2.1 준수
- **키보드 네비게이션**: 모든 기능 키보드 접근 가능
- **스크린 리더**: ARIA 레이블 및 역할
- **색상 대비**: 충분한 색상 대비
- **포커스 관리**: 명확한 포커스 표시

#### 사용자 경험
- **로딩 상태**: 명확한 로딩 피드백
- **에러 처리**: 사용자 친화적 에러 메시지
- **성공 피드백**: 작업 완료 알림

## 사용 방법

### 테마 사용

```tsx
import { useTheme } from './shared/theme';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div style={{ color: theme.colors.primary[500] }}>
      <button onClick={toggleTheme}>테마 변경</button>
    </div>
  );
}
```

### 컴포넌트 사용

```tsx
import { PageHeader, StatsCard, DataTable } from './shared/components/ui';

function Dashboard() {
  return (
    <div>
      <PageHeader
        title="대시보드"
        description="시스템 현황을 확인하세요"
        actions={<Button>새로고침</Button>}
      />
      
      <StatsCard
        title="총 사용자"
        value={1128}
        trend={{ value: 12.5, isPositive: true }}
        icon={<UserOutlined />}
      />
    </div>
  );
}
```

### 훅 사용

```tsx
import { useDebounce, useLocalStorage, useIsMobile } from './shared/hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const isMobile = useIsMobile();
  
  // 검색 로직...
}
```

## 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 성능 지표

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 향후 개선 계획

1. **다크 모드 완전 구현**
2. **국제화 (i18n) 지원**
3. **PWA 기능 추가**
4. **고급 애니메이션 효과**
5. **컴포넌트 문서화 (Storybook)**

## 참고 자료

- [Ant Design](https://ant.design/)
- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [React 접근성 가이드](https://reactjs.org/docs/accessibility.html)
- [Vite 최적화 가이드](https://vitejs.dev/guide/build.html)
