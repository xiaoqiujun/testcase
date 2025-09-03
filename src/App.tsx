import { useEffect } from "react"
import TestCasePage from "./TestCasePage"
import { logger } from "./utils/logger"
import { check } from "@tauri-apps/plugin-updater"
import { relaunch } from "@tauri-apps/plugin-process"
import { IconBrandGithub } from "@tabler/icons-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

function App() {
	useEffect(() => {
		logger.info("🚀 前端应用程序启动")
		// 带上下文的日志示例
		logger.info("应用环境", {
			isDev: import.meta.env.DEV,
			mode: import.meta.env.MODE,
		})

		// 自动更新逻辑 - 应用加载5秒后检查更新
		const checkForUpdates = async () => {
			try {
				const update = await check()
				if (update) {
					logger.info(`有可用更新: ${update.version}`)

					// 显示确认对话框
					const shouldUpdate = confirm(`有可用更新: ${update.version}\n\n您想现在安装这个更新吗？`)

					if (shouldUpdate) {
						try {
							// 下载并安装，记录进度
							await update.downloadAndInstall((event) => {
								switch (event.event) {
									case "Started":
										logger.info(`开始下载 ${event.data.contentLength} 字节`)
										break
									case "Progress":
										logger.info(`已下载: ${event.data.chunkLength} 字节`)
										break
									case "Finished":
										logger.info("下载完成，正在安装...")
										break
								}
							})

							// 询问用户是否现在重启
							const shouldRestart = confirm("更新安装成功！\n\n您想现在重启应用程序以使用新版本吗？")

							if (shouldRestart) {
								await relaunch()
							}
						} catch (updateError) {
							logger.error(`更新安装失败: ${String(updateError)}`)
							alert(`更新失败: 自动下载过程中出现问题。\n\n${String(updateError)}`)
						}
					}
				}
			} catch (checkError) {
				logger.error(`更新检查失败: ${String(checkError)}`)
				// 更新检查静默失败 - 不要因网络问题打扰用户
			}
		}

		// 应用加载5秒后检查更新
		const updateTimer = setTimeout(checkForUpdates, 5000)
		return () => clearTimeout(updateTimer)
	}, [])

	const onClick = () => {
		window.open("https://github.com/xiaoqiujun/testcase", "_blank")
	}
	return (
		<div className="w-full h-full">
			<div className="flex p-6 max-w-5xl mx-auto">
				<Tooltip delayDuration={200}>
					<TooltipTrigger asChild>
						<button onClick={onClick} aria-label="项目仓库">
							<IconBrandGithub className="w-6 h-6" stroke={2} />
						</button>
					</TooltipTrigger>
					<TooltipContent>
						<p>项目仓库</p>
					</TooltipContent>
				</Tooltip>
			</div>
			<TestCasePage />
		</div>
	)
}

export default App
