import React from 'react'
import { reportError } from '@/lib/observability'
import { Button } from '@/components/ui/button'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, {
      type: 'react.error_boundary',
      componentStack: info.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">ระบบพบข้อผิดพลาด</h1>
            <p className="mt-2 text-sm text-slate-600">{this.state.message}</p>
            <Button className="mt-4" onClick={() => window.location.assign('/')}>
              กลับหน้าแรก
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
