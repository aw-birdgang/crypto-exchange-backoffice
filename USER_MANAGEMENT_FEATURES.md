# 사용자 관리 기능

## 개요

회원가입 후 승인대기 및 상태업데이트 관련 기능이 추가된 백오피스 시스템입니다. 관리자는 사용자의 가입을 승인/거부하고, 사용자 상태를 관리할 수 있습니다.

## 주요 기능

### 1. 사용자 상태 관리
- **PENDING**: 승인 대기 중
- **APPROVED**: 승인됨
- **REJECTED**: 거부됨
- **SUSPENDED**: 정지됨

### 2. 사용자 승인/거부
- 개별 사용자 승인/거부
- 대량 사용자 승인/거부
- 승인 시 역할 부여 (관리자, 모더레이터, 지원팀, 감사자)
- 승인 시 계정 활성화/비활성화 설정

### 3. 사용자 조회 및 필터링
- 전체 사용자 목록 조회
- 상태별 사용자 조회
- 역할별 사용자 조회
- 활성/비활성 사용자 조회
- 검색 기능 (이메일, 이름, 사용자명)

### 4. 사용자 통계
- 전체 사용자 수
- 활성 사용자 수
- 승인 대기 사용자 수
- 오늘 가입한 사용자 수
- 이번 주/달 가입 통계
- 역할별 사용자 통계

## 페이지 구조

### 1. 사용자 관리 페이지 (`/users`)
- 전체 사용자 목록 조회
- 사용자 필터링 및 검색
- 대량 작업 기능
- 사용자 승인/거부/수정/삭제

### 2. 승인 대기 페이지 (`/users/pending`)
- 승인 대기 중인 사용자만 조회
- 빠른 승인/거부 처리
- 실시간 업데이트 (30초마다 자동 새로고침)

### 3. 상태별 페이지
- `/users/approved`: 승인된 사용자
- `/users/rejected`: 거부된 사용자
- `/users/suspended`: 정지된 사용자

## 컴포넌트 구조

### 1. UserTable
- 사용자 목록을 테이블 형태로 표시
- 정렬 기능
- 선택 기능 (체크박스)
- 액션 버튼 (승인, 거부, 수정, 삭제)

### 2. UserFilters
- 상태별 필터링
- 역할별 필터링
- 활성 상태 필터링
- 검색 기능
- 정렬 옵션

### 3. UserApprovalModal
- 사용자 승인/거부 모달
- 역할 선택
- 활성화 설정

### 4. BulkActionModal
- 대량 작업 모달
- 여러 사용자에 대한 일괄 처리
- 작업 유형 선택 (승인, 거부, 정지, 활성화, 비활성화)

### 5. UserStatsCards
- 사용자 통계를 카드 형태로 표시
- 실시간 데이터 업데이트

## API 엔드포인트

### 사용자 관리
- `GET /admin/admins` - 전체 사용자 목록
- `GET /admin/users/pending` - 승인 대기 사용자
- `GET /admin/users/status/:status` - 상태별 사용자
- `PUT /admin/users/:id/approve` - 사용자 승인
- `PUT /admin/users/:id/reject` - 사용자 거부
- `PUT /admin/users/:id` - 사용자 정보 수정
- `DELETE /admin/users/:id` - 사용자 삭제
- `POST /admin/users/bulk-action` - 대량 작업

### 통계
- `GET /admin/stats` - 사용자 통계

## 권한 관리

### 필요한 권한
- `users:read` - 사용자 조회
- `users:create` - 사용자 생성
- `users:update` - 사용자 수정
- `users:delete` - 사용자 삭제
- `users:manage` - 사용자 관리 (모든 권한)

### 역할별 권한
- **SUPER_ADMIN**: 모든 사용자 관리 권한
- **ADMIN**: 사용자 조회, 승인, 수정 권한
- **MODERATOR**: 사용자 조회, 승인 권한
- **SUPPORT**: 사용자 조회 권한
- **AUDITOR**: 사용자 조회 권한

## 상태 관리

### Zustand Store
- `useUserStore`: 사용자 목록, 선택된 사용자, 필터 상태
- `useUserSelectors`: 필터링된 사용자, 통계 데이터

### React Query
- 서버 상태 캐싱 및 동기화
- 자동 백그라운드 업데이트
- 낙관적 업데이트

## 사용법

### 1. 사용자 승인
1. "사용자 관리" → "승인 대기" 메뉴로 이동
2. 승인할 사용자 선택
3. "승인" 버튼 클릭
4. 역할 및 활성화 설정
5. "승인" 버튼으로 확인

### 2. 대량 승인
1. "사용자 관리" → "전체 사용자" 메뉴로 이동
2. 승인할 사용자들을 체크박스로 선택
3. "대량 작업" 버튼 클릭
4. "승인" 작업 선택
5. 역할 설정 후 실행

### 3. 사용자 검색
1. 필터 영역의 검색창에 검색어 입력
2. 엔터키 또는 검색 버튼 클릭
3. 결과가 자동으로 필터링됨

### 4. 사용자 필터링
1. 상태, 역할, 활성 상태 드롭다운에서 선택
2. 정렬 기준 및 순서 설정
3. 페이지 크기 조정
4. "필터 초기화" 버튼으로 초기화

## 기술 스택

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand, React Query
- **UI Components**: Ant Design
- **Routing**: React Router v6
- **HTTP Client**: Axios (ApiService)

## 개발 가이드

### 새로운 컴포넌트 추가
1. `src/features/users/presentation/components/`에 컴포넌트 생성
2. `src/features/users/index.ts`에 export 추가
3. 필요한 경우 타입 정의를 `packages/shared/src/types/index.ts`에 추가

### 새로운 API 엔드포인트 추가
1. `src/features/users/application/services/user.service.ts`에 메서드 추가
2. `src/features/users/application/hooks/useUsers.ts`에 훅 추가
3. 컴포넌트에서 훅 사용

### 권한 추가
1. `packages/shared/src/types/index.ts`에 권한 정의
2. `packages/shared/src/constants/app.constants.ts`에 메뉴 권한 추가
3. 컴포넌트에서 권한 체크 로직 추가
