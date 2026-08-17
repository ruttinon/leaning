import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { photos } from '@/lib/media'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-6 py-12">
        <div className="w-full max-w-lg border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
          <img src={photos.emptyDesk} alt="" className="mx-auto mb-6 h-36 w-full object-cover" />
          <p className="kicker">เกิดข้อผิดพลาด</p>
          <h1 className="mt-3 text-3xl">หน้านี้ใช้งานไม่ได้ชั่วคราว</h1>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            ลองโหลดใหม่ หรือกลับไปหน้าแรก
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button className="rounded-sm" onClick={this.handleReload}>โหลดหน้าใหม่</Button>
            <Link to="/">
              <Button variant="outline" className="rounded-sm">กลับหน้าแรก</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
