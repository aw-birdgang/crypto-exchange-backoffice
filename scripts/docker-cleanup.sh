#!/bin/bash

# Docker 완전 정리 스크립트
# 사용법: ./docker-cleanup.sh [옵션]
# 옵션:
#   --all: 모든 리소스 제거 (볼륨 포함)
#   --safe: 안전한 정리만 (사용하지 않는 리소스만)
#   --images: 이미지만 제거
#   --containers: 컨테이너만 제거
#   --volumes: 볼륨만 제거
#   --cache: 빌드 캐시만 제거

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Docker가 실행 중인지 확인
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker가 실행 중이지 않습니다. Docker Desktop을 시작해주세요."
        exit 1
    fi
}

# 컨테이너 정리
cleanup_containers() {
    log_info "컨테이너 정리 중..."
    
    # 실행 중인 컨테이너 중지
    running_containers=$(docker ps -q)
    if [ -n "$running_containers" ]; then
        log_info "실행 중인 컨테이너 중지 중..."
        docker stop $running_containers
        log_success "실행 중인 컨테이너 중지 완료"
    else
        log_info "실행 중인 컨테이너가 없습니다."
    fi
    
    # 모든 컨테이너 제거
    all_containers=$(docker ps -aq)
    if [ -n "$all_containers" ]; then
        log_info "모든 컨테이너 제거 중..."
        docker rm $all_containers
        log_success "컨테이너 제거 완료"
    else
        log_info "제거할 컨테이너가 없습니다."
    fi
}

# 이미지 정리
cleanup_images() {
    log_info "이미지 정리 중..."
    
    all_images=$(docker images -q)
    if [ -n "$all_images" ]; then
        log_info "모든 이미지 제거 중..."
        docker rmi -f $all_images
        log_success "이미지 제거 완료"
    else
        log_info "제거할 이미지가 없습니다."
    fi
}

# 볼륨 정리
cleanup_volumes() {
    log_info "볼륨 정리 중..."
    
    all_volumes=$(docker volume ls -q)
    if [ -n "$all_volumes" ]; then
        log_warning "모든 볼륨을 제거합니다. 중요한 데이터가 있다면 백업해주세요."
        read -p "계속하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker volume rm $all_volumes
            log_success "볼륨 제거 완료"
        else
            log_info "볼륨 제거를 취소했습니다."
        fi
    else
        log_info "제거할 볼륨이 없습니다."
    fi
}

# 네트워크 정리
cleanup_networks() {
    log_info "네트워크 정리 중..."
    
    # 기본 네트워크 제외하고 제거
    custom_networks=$(docker network ls -q --filter type=custom)
    if [ -n "$custom_networks" ]; then
        docker network rm $custom_networks
        log_success "사용자 정의 네트워크 제거 완료"
    else
        log_info "제거할 사용자 정의 네트워크가 없습니다."
    fi
}

# 빌드 캐시 정리
cleanup_cache() {
    log_info "빌드 캐시 정리 중..."
    docker builder prune -a -f
    log_success "빌드 캐시 제거 완료"
}

# 시스템 전체 정리
cleanup_system() {
    log_info "시스템 전체 정리 중..."
    docker system prune -a -f
    log_success "시스템 정리 완료"
}

# 안전한 정리 (사용하지 않는 리소스만)
safe_cleanup() {
    log_info "안전한 정리 시작..."
    
    # 사용하지 않는 컨테이너 제거
    log_info "사용하지 않는 컨테이너 제거 중..."
    docker container prune -f
    
    # 사용하지 않는 이미지 제거
    log_info "사용하지 않는 이미지 제거 중..."
    docker image prune -a -f
    
    # 사용하지 않는 볼륨 제거
    log_info "사용하지 않는 볼륨 제거 중..."
    docker volume prune -f
    
    # 사용하지 않는 네트워크 제거
    log_info "사용하지 않는 네트워크 제거 중..."
    docker network prune -f
    
    # 빌드 캐시 제거
    cleanup_cache
    
    log_success "안전한 정리 완료"
}

# 사용법 출력
show_usage() {
    echo "Docker 정리 스크립트"
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  --all        모든 리소스 제거 (볼륨 포함) - 주의!"
    echo "  --safe       안전한 정리만 (사용하지 않는 리소스만)"
    echo "  --images     이미지만 제거"
    echo "  --containers 컨테이너만 제거"
    echo "  --volumes    볼륨만 제거"
    echo "  --cache      빌드 캐시만 제거"
    echo "  --help       이 도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0 --safe      # 안전한 정리"
    echo "  $0 --all       # 모든 리소스 제거"
    echo "  $0 --images    # 이미지만 제거"
}

# 메인 함수
main() {
    echo "=========================================="
    echo "🐳 Docker 정리 스크립트"
    echo "=========================================="
    
    # Docker 상태 확인
    check_docker
    
    # 옵션 처리
    case "${1:-}" in
        --all)
            log_warning "모든 Docker 리소스를 제거합니다. 이 작업은 되돌릴 수 없습니다!"
            read -p "정말로 계속하시겠습니까? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cleanup_containers
                cleanup_images
                cleanup_volumes
                cleanup_networks
                cleanup_cache
                log_success "모든 Docker 리소스 제거 완료!"
            else
                log_info "작업을 취소했습니다."
            fi
            ;;
        --safe)
            safe_cleanup
            ;;
        --images)
            cleanup_images
            ;;
        --containers)
            cleanup_containers
            ;;
        --volumes)
            cleanup_volumes
            ;;
        --cache)
            cleanup_cache
            ;;
        --help|-h)
            show_usage
            ;;
        "")
            log_info "옵션을 지정하지 않았습니다. 안전한 정리를 실행합니다."
            safe_cleanup
            ;;
        *)
            log_error "알 수 없는 옵션: $1"
            show_usage
            exit 1
            ;;
    esac
    
    echo "=========================================="
    log_success "Docker 정리 완료!"
    echo "=========================================="
}

# 스크립트 실행
main "$@"
