# -------------------------------
# 1단계: Node.js 빌드 단계
# -------------------------------
FROM node:20 AS build

WORKDIR /app

# 의존성 파일 먼저 복사
COPY package*.json ./

# 캐시 삭제 + 안정적인 설치
RUN rm -rf node_modules package-lock.json && npm install

# 전체 소스 복사
COPY . .

# 실행 권한 부여 (Vite용)
RUN chmod -R +x node_modules/.bin

# 빌드 실행
RUN npm run build --unsafe-perm

# -------------------------------
# 2단계: Nginx 기반 정적 파일 서빙
# -------------------------------
FROM nginx:alpine

# COPY ./default.conf /etc/nginx/conf.d/default.conf
# 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80
