# mino-connector-engine-assist

引擎代办：统一安装/登记各连接器的第三方引擎（yt-dlp / scrcpy / platform-tools / whisper-cli / llama-server / localsend / es / hackbrowserdata / ffmpeg）。

- `engine_status`：哪些就绪哪些缺
- `engine_setup`：自动下载官方 release 到 `~/.dsh/engines/`（用户一句「帮我装」）
- `engine_register`：手动装好的登记进 `~/.dsh/engines.json`，全货架共享

合规口径：引擎=用户机器上用户点头的第三方工具，本体不捆绑破解/解密能力；微信/QQ 解密引擎只走 `engine_register` 手动登记。
