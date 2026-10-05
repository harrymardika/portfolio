@AGENTS.md

# Tambahan khusus Claude Code

- Gunakan **plan mode** untuk tugas yang menyentuh lebih dari 3 file atau mengubah arsitektur.
- Sebelum menyatakan tugas selesai, jalankan verifikasi dari Definition of Done dan laporkan hasilnya apa adanya.
- Setelah perubahan UI, jalankan aplikasi dan lihat hasilnya (skill `run`, atau screenshot dengan Playwright), ukuran desktop dan HP.
- Reviewer: sebelum merge, jalankan subagent `reviewer` (`.claude/agents/reviewer.md`) atau `/code-review`. Untuk perubahan yang menyentuh Docker, CI, atau header keamanan, jalankan juga `/security-review`.
- Jangan membuat banyak subagent untuk menulis kode secara paralel di file yang sama. Satu sesi utama yang menulis kode; subagent hanya untuk riset atau review.
