import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'castle-install-prompt-dismissed-until'
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000

function isInstalled() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return standalone || iosStandalone
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (isInstalled()) return

    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) ?? 0)
    if (dismissedUntil > Date.now()) return

    const timer = window.setTimeout(() => setVisible(true), 1400)
    const captureInstallEvent = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      setVisible(true)
    }
    const hideAfterInstall = () => setVisible(false)

    window.addEventListener('beforeinstallprompt', captureInstallEvent)
    window.addEventListener('appinstalled', hideAfterInstall)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', captureInstallEvent)
      window.removeEventListener('appinstalled', hideAfterInstall)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_FOR_MS))
    setVisible(false)
  }

  const install = async () => {
    if (!installEvent) {
      setShowHelp(true)
      return
    }

    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      setVisible(false)
    } else {
      dismiss()
    }
    setInstallEvent(null)
  }

  if (!visible) return null

  return (
    <aside className="install-prompt" role="dialog" aria-modal="false" aria-labelledby="install-prompt-title">
      <img src={`${import.meta.env.BASE_URL}app-icon-192.png`} alt="" />
      <div className="install-prompt-copy">
        <strong id="install-prompt-title">ثبّت تطبيق القلعة</strong>
        <p>{showHelp ? 'من قائمة المتصفح أو المشاركة اختر «إضافة إلى الشاشة الرئيسية».' : 'وصول أسرع للعقارات من شاشة هاتفك.'}</p>
      </div>
      <div className="install-prompt-actions">
        <button type="button" className="install-primary" onClick={() => void install()}>ثبّت البرنامج</button>
        <button type="button" className="install-skip" onClick={dismiss}>تخطي</button>
      </div>
    </aside>
  )
}
