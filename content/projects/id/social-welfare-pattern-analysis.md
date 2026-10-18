---
title: Indonesian Worker Welfare Pattern Analysis
---

## Masalah
Memahami kesejahteraan pekerja di berbagai provinsi Indonesia membutuhkan analisis hubungan kompleks antara upah minimum provinsi (UMP), upah rata-rata, garis kemiskinan, dan pengeluaran per kapita. Statistik sederhana tidak cukup untuk menangkap pola ekonomi daerah dan ketimpangan perkotaan-perdesaan.

## Pendekatan
Saya mengintegrasikan empat dataset sosio-ekonomi daerah dan melakukan preprocessing menggunakan KNN imputation serta MinMax scaling. Saya mengevaluasi algoritma clustering KMeans, Agglomerative, dan DBSCAN, lalu memilih KMeans dengan 9 klaster berdasarkan silhouette score dan elbow method. Selanjutnya, saya membangun dan melakukan hyperparameter tuning pada model klasifikasi seperti Random Forest, SVM, dan Gradient Boosting untuk memprediksi keanggotaan klaster.

## Hasil
- Mencapai skor silhouette 0,719 dengan 9 klaster ekonomi yang terpisah jelas menggunakan KMeans.
- Membangun model klasifikasi Random Forest, SVM, dan Gradient Boosting yang mencapai akurasi dan F1-score 1,0 dalam memprediksi keanggotaan klaster ekonomi.
- Mengidentifikasi temuan utama yang menunjukkan bahwa upah minimum yang lebih tinggi tidak selalu meningkatkan daya beli daerah dan bahwa pola pengeluaran berbeda secara signifikan antara wilayah perkotaan dan perdesaan.
