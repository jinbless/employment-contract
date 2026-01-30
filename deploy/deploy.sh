#!/bin/bash

# ===========================================
# 근로계약서 AI 분석 서비스 배포 스크립트
# moellab.info/contract
# ===========================================

set -e  # 에러 발생 시 중단

echo "🚀 근로계약서 AI 분석 서비스 배포 시작..."

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 프로젝트 디렉토리
PROJECT_DIR="/opt/employment-contract"
NGINX_LANDING="/var/www/moellab/index.html"

# 1단계: 프로젝트 업데이트
echo -e "${YELLOW}[1/6] 프로젝트 업데이트 중...${NC}"
cd $PROJECT_DIR
git pull origin main

# 2단계: .env 파일 확인
echo -e "${YELLOW}[2/6] 환경 변수 확인 중...${NC}"
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
    echo -e "${RED}❌ server/.env 파일이 없습니다!${NC}"
    echo "다음 내용으로 server/.env 파일을 생성하세요:"
    echo "OPENAI_API_KEY=your_api_key_here"
    exit 1
fi
echo -e "${GREEN}✅ .env 파일 확인 완료${NC}"

# 3단계: Docker 네트워크 확인/생성
echo -e "${YELLOW}[3/6] Docker 네트워크 확인 중...${NC}"
if ! docker network ls | grep -q "moellab-network"; then
    echo "moellab-network 생성 중..."
    docker network create moellab-network
fi
echo -e "${GREEN}✅ Docker 네트워크 준비 완료${NC}"

# 4단계: Docker 빌드 및 실행
echo -e "${YELLOW}[4/6] Docker 컨테이너 빌드 및 실행 중...${NC}"
docker-compose down --remove-orphans || true
docker-compose build --no-cache
docker-compose up -d

# 5단계: 헬스체크
echo -e "${YELLOW}[5/6] 서비스 헬스체크 중...${NC}"
sleep 5
if curl -s http://localhost:3002/api/tips/random | grep -q "tip"; then
    echo -e "${GREEN}✅ 백엔드 서버 정상 작동${NC}"
else
    echo -e "${RED}❌ 백엔드 서버 응답 없음${NC}"
    echo "로그 확인: docker logs employment-contract"
    exit 1
fi

# 6단계: Nginx 설정 업데이트
echo -e "${YELLOW}[6/6] Nginx 설정 업데이트 중...${NC}"

# 랜딩 페이지 업데이트
cp $PROJECT_DIR/deploy/index.html $NGINX_LANDING
echo -e "${GREEN}✅ 랜딩 페이지 업데이트 완료${NC}"

# Nginx 설정 백업 및 업데이트 (수동으로 해야 함)
echo ""
echo -e "${YELLOW}⚠️  Nginx 설정을 수동으로 업데이트해야 합니다:${NC}"
echo "   1. sudo nano /etc/nginx/sites-available/moellab.info"
echo "   2. deploy/nginx.conf 내용 참고하여 /contract 관련 설정 추가"
echo "   3. sudo nginx -t"
echo "   4. sudo systemctl reload nginx"
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo "=========================================="
echo ""
echo "서비스 URL: https://moellab.info/contract/"
echo "로그 확인: docker logs -f employment-contract"
echo "컨테이너 상태: docker ps | grep employment-contract"
