FROM nginx:alpine 
#burada docker imajının temelini seçiyoruz.“nginx” isimli resmi Docker imajını kullanıyoruz.
#Alpine Linux, çok minimal ve sadece temel gereksinimleri içeren bir Linux dağıtımıdır.
#Böylece imajın boyutu küçük olur, hızlı indirilir ve çalışır.
COPY . /usr/share/nginx/html
#COPY komutu, dosya ve klasörleri Docker imajının içine kopyalamak için kullanılır.
