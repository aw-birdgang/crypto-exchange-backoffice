-- =====================================================
-- Crypto Exchange Backoffice Database Initialization
-- =====================================================

-- 데이터베이스 생성 (이미 docker-compose에서 생성됨)
-- CREATE DATABASE IF NOT EXISTS crypto_exchange;
-- USE crypto_exchange;

-- =====================================================
-- 테이블과 데이터는 TypeORM과 초기화 스크립트로 관리됩니다.
-- 
-- 사용 방법:
-- 1. Docker 컨테이너 시작: docker compose up -d
-- 2. 데이터베이스 초기화: pnpm init:db
-- =====================================================

SELECT 'Database ready for TypeORM initialization!' as message;