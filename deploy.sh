#!/bin/bash
set -e

# ==========================================
# 여행 플래너 - NAS 배포 스크립트
# ==========================================
# GHCR에서 이미지를 풀받아 배포합니다.
# 사용법: ./deploy.sh {pull|deploy|update|status|logs|stop|restart|cleanup}

# .env 파일 로드
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# 설정
GHCR_USERNAME="${GHCR_USERNAME:-hyunjoonkwak}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
COMPOSE_FILE="docker-compose.prod.yml"

# 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# docker compose 경로 (NAS 환경)
DOCKER_COMPOSE="/usr/local/bin/docker compose"
if ! command -v docker &> /dev/null; then
    DOCKER_COMPOSE="/usr/local/bin/docker compose"
fi

# 이미지 풀
pull_images() {
    log_info "GHCR에서 이미지 풀링 중... (태그: ${IMAGE_TAG})"
    GHCR_USERNAME=${GHCR_USERNAME} IMAGE_TAG=${IMAGE_TAG} \
        ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} pull
    log_info "이미지 풀 완료!"
}

# 배포
deploy() {
    log_info "컨테이너 배포 중..."
    mkdir -p data
    GHCR_USERNAME=${GHCR_USERNAME} IMAGE_TAG=${IMAGE_TAG} \
        ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} up -d
    log_info "배포 완료!"
    echo ""
    ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} ps
}

# 업데이트 (풀 + 배포)
update() {
    log_info "업데이트 시작..."
    log_info "기존 컨테이너 중지..."
    GHCR_USERNAME=${GHCR_USERNAME} IMAGE_TAG=${IMAGE_TAG} \
        ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} down || true
    pull_images
    deploy
    echo ""
    log_info "=========================================="
    log_info "업데이트 완료!"
    log_info "=========================================="
    echo ""
    echo "여행 플래너: http://localhost:3900"
}

# 상태 확인
status() {
    echo "=== 컨테이너 상태 ==="
    ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} ps
    echo ""
    echo "=== GHCR 이미지 ==="
    docker images | grep "ghcr.io/${GHCR_USERNAME}/travel-planner" || echo "GHCR 이미지 없음"
}

# 로그
logs() {
    ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} logs -f --tail=100
}

# 중지
stop() {
    log_info "컨테이너 중지 중..."
    ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} down
    log_info "중지 완료!"
}

# 재시작
restart() {
    log_info "컨테이너 재시작 중..."
    ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} restart
    log_info "재시작 완료!"
}

# 정리
cleanup() {
    log_info "사용하지 않는 Docker 리소스 정리 중..."
    docker system prune -f
    docker image prune -f
    log_info "정리 완료!"
}

# 도움말
show_help() {
    echo "=========================================="
    echo "  여행 플래너 - NAS 배포 스크립트"
    echo "=========================================="
    echo ""
    echo "사용법: $0 <command>"
    echo ""
    echo "=== 배포 명령어 ==="
    echo "  pull              - GHCR에서 이미지 풀"
    echo "  deploy            - 컨테이너 시작"
    echo "  update            - 이미지 풀 + 컨테이너 재시작 (권장)"
    echo "  stop              - 컨테이너 중지"
    echo "  restart           - 컨테이너 재시작"
    echo "  status            - 상태 확인"
    echo ""
    echo "=== 로그 ==="
    echo "  logs              - 전체 로그"
    echo ""
    echo "=== 유지보수 ==="
    echo "  cleanup           - Docker 리소스 정리"
    echo ""
    echo "=== 환경변수 (.env) ==="
    echo "  GHCR_USERNAME     - GHCR 사용자명 (기본: hyunjoonkwak)"
    echo "  IMAGE_TAG         - 이미지 태그 (기본: latest)"
    echo ""
    echo "=== 포트 ==="
    echo "  3900              - 여행 플래너"
    echo ""
}

# 명령어 처리
case "${1:-help}" in
    pull)       pull_images ;;
    deploy)     deploy ;;
    update)     update ;;
    stop)       stop ;;
    restart)    restart ;;
    status)     status ;;
    logs)       logs ;;
    cleanup)    cleanup ;;
    help|--help|-h) show_help ;;
    *)
        log_error "알 수 없는 명령어: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
