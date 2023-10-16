# Notice: 请在项目根目录下执行该脚本

# 同步 config/root-directory 下的文件到 / 目录下
# 复制根目录下的文件
cp -a frontend-config/.env.*   ./
cp -a frontend-config/package.json   ./
cp -a frontend-config/.yarnrc  ./
# 复制 assets 的目录
cp -a frontend-config/assets/images/*   ./src/assets/images/
# 复制 public 的目录
cp -a frontend-config/public/*   ./public/
# 复制 utils 的目录
cp -a frontend-config/utils/*   ./src/utils/
