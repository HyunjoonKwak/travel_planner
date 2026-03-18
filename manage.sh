#!/bin/bash

# 여행 플래너 관리 스크립트

APP_NAME="travel-planner"
COMPOSE_FILE="docker-compose.yml"
GHCR_USERNAME="${GHCR_USERNAME:-hyunjoonkwak}"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

CMD="$1 $2"
CMD="${CMD% }"

case "$CMD" in
    # ===========================================
    # 로컬 개발 (Docker)
    # ===========================================
    start)
        log_info "$APP_NAME 시작 중..."
        docker-compose -f $COMPOSE_FILE up -d
        log_info "시작 완료: http://localhost:3900"
        ;;
    stop)
        log_info "$APP_NAME 중지 중..."
        docker-compose -f $COMPOSE_FILE down
        ;;
    restart)
        log_info "$APP_NAME 재시작 중..."
        docker-compose -f $COMPOSE_FILE down
        docker-compose -f $COMPOSE_FILE up -d
        ;;
    rebuild)
        log_info "$APP_NAME 리빌드 중..."
        docker-compose -f $COMPOSE_FILE down
        docker-compose -f $COMPOSE_FILE up -d --build
        ;;
    logs)
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    status)
        docker-compose -f $COMPOSE_FILE ps
        ;;
    dev)
        log_info "개발 서버 시작..."
        npm run dev
        ;;

    # ===========================================
    # GHCR 배포 (로컬 → NAS)
    # ===========================================
    "ghcr login"|"ghcr:login")
        log_info "GHCR 로그인 중..."
        echo "GitHub Personal Access Token을 입력하세요:"
        read -s GITHUB_TOKEN
        echo ""
        if echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin; then
            log_info "GHCR 로그인 성공!"
        else
            log_error "GHCR 로그인 실패"
            exit 1
        fi
        ;;

    "ghcr push"|"ghcr:push"|"ghcr push --no-cache"|"ghcr:push --no-cache")
        NO_CACHE=""
        IMAGE_TAG="latest"
        for arg in "$@"; do
            case "$arg" in
                --no-cache) NO_CACHE="--no-cache" ;;
                ghcr|ghcr:push|push) ;;
                *) IMAGE_TAG="$arg" ;;
            esac
        done
        log_info "GHCR에 이미지 푸시 중... (태그: $IMAGE_TAG)${NO_CACHE:+ [no-cache]}"

        # Buildx 빌더 확인/생성
        if ! docker buildx inspect multiarch-builder > /dev/null 2>&1; then
            log_info "멀티 플랫폼 빌더 생성 중..."
            docker buildx create --name multiarch-builder --driver docker-container --bootstrap
        fi
        docker buildx use multiarch-builder

        # 이미지 빌드 및 푸시
        log_info "이미지 빌드 및 푸시 중..."
        docker buildx build \
            ${NO_CACHE} \
            --platform ${BUILD_PLATFORM:-linux/amd64} \
            -t ghcr.io/${GHCR_USERNAME}/${APP_NAME}:${IMAGE_TAG} \
            --push \
            .

        if [ $? -ne 0 ]; then
            log_error "이미지 푸시 실패"
            exit 1
        fi

        echo ""
        log_info "=========================================="
        log_info "이미지 푸시 완료!"
        log_info "=========================================="
        echo ""
        echo "이미지: ghcr.io/${GHCR_USERNAME}/${APP_NAME}:${IMAGE_TAG}"
        echo ""
        echo "NAS에서 배포:"
        echo "  ./deploy.sh update"
        ;;

    "deploy"|"ghcr:deploy")
        log_info "=========================================="
        log_info "  원커맨드 배포: 빌드 → 푸시 → NAS 배포"
        log_info "=========================================="

        IMAGE_TAG="latest"
        NO_CACHE=""
        for arg in "$@"; do
            case "$arg" in
                --no-cache) NO_CACHE="--no-cache" ;;
                deploy|ghcr:deploy) ;;
                *) IMAGE_TAG="$arg" ;;
            esac
        done

        # Step 1: GHCR 빌드 & 푸시
        log_info "[1/3] 이미지 빌드 및 GHCR 푸시 중... (태그: $IMAGE_TAG)"
        if ! docker buildx inspect multiarch-builder > /dev/null 2>&1; then
            docker buildx create --name multiarch-builder --driver docker-container --bootstrap
        fi
        docker buildx use multiarch-builder

        docker buildx build \
            ${NO_CACHE} \
            --platform ${BUILD_PLATFORM:-linux/amd64} \
            -t ghcr.io/${GHCR_USERNAME}/${APP_NAME}:${IMAGE_TAG} \
            --push \
            .

        if [ $? -ne 0 ]; then
            log_error "이미지 빌드/푸시 실패"
            exit 1
        fi
        log_info "[1/3] 이미지 푸시 완료!"

        # Step 2: NAS에서 deploy.sh update 실행
        NAS_PATH="/volume1/code_work/travel_planner"
        log_info "[2/3] NAS 배포 중... (ssh nas)"
        ssh -o ConnectTimeout=30 nas "sudo bash -c 'cd ${NAS_PATH} && IMAGE_TAG=${IMAGE_TAG} bash deploy.sh update'" 2>&1 | grep -v "WARNING\|vulnerable\|upgraded"

        if [ $? -ne 0 ]; then
            log_error "NAS 배포 실패"
            exit 1
        fi

        # Step 3: 헬스체크
        log_info "[3/3] 헬스체크 중..."
        sleep 5
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://travel.specialrisk.me/ 2>/dev/null || echo "000")
        if [ "$HTTP_STATUS" = "200" ]; then
            log_info "헬스체크 성공 (HTTP ${HTTP_STATUS})"
        else
            log_warning "헬스체크 실패 (HTTP ${HTTP_STATUS}) — NAS 로그를 확인하세요"
        fi

        echo ""
        log_info "=========================================="
        log_info "  배포 완료!"
        log_info "=========================================="
        echo "  사이트: https://travel.specialrisk.me"
        echo ""
        ;;

    "ghcr status"|"ghcr:status")
        log_info "GHCR 이미지 확인 중..."
        docker images | grep "ghcr.io/${GHCR_USERNAME}/${APP_NAME}" || echo "로컬에 GHCR 이미지 없음"
        ;;

    # ===========================================
    # 셸 접속
    # ===========================================
    shell)
        log_info "컨테이너 셸 접속..."
        docker exec -it ${APP_NAME} /bin/sh
        ;;

    # ===========================================
    # 도움말
    # ===========================================
    *)
        echo "=========================================="
        echo "  여행 플래너 관리 스크립트"
        echo "=========================================="
        echo ""
        echo "사용법: $0 <command>"
        echo ""
        echo "=== 로컬 개발 ==="
        echo "  dev                - 개발 서버 시작 (npm run dev)"
        echo "  start              - Docker 컨테이너 시작 (http://localhost:3900)"
        echo "  stop               - 컨테이너 중지"
        echo "  restart            - 컨테이너 재시작"
        echo "  rebuild            - 이미지 빌드 후 재시작"
        echo "  logs               - 로그 보기"
        echo "  status             - 컨테이너 상태"
        echo ""
        echo "=== GHCR 배포 (로컬 → NAS) ==="
        echo "  deploy             - 원커맨드 배포 (빌드→푸시→NAS배포→헬스체크)"
        echo "  ghcr:login         - GHCR 로그인"
        echo "  ghcr:push [tag]    - 멀티플랫폼 이미지 빌드 및 GHCR 푸시"
        echo "  ghcr:status        - GHCR 이미지 상태"
        echo ""
        echo "=== 셸 ==="
        echo "  shell              - 컨테이너 셸 접속"
        echo ""
        echo "=== 포트 ==="
        echo "  3900               - 여행 플래너"
        echo ""
        exit 1
        ;;
esac
