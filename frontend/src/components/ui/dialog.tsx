import * as React from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  )
}

const DialogContent: React.FC<DialogContentProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
    {...props}
  >
    <div className={className}>{children}</div>
  </div>
)

const DialogHeader: React.FC<DialogHeaderProps> = ({ className, ...props }) => (
  <div className={`p-6 ${className}`} {...props} />
)

const DialogTitle: React.FC<DialogTitleProps> = ({ className, ...props }) => (
  <h2
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
)

const DialogDescription: React.FC<DialogDescriptionProps> = ({
  className,
  ...props
}) => (
  <p className={`text-sm text-gray-500 mt-2 ${className}`} {...props} />
)

const DialogFooter: React.FC<DialogFooterProps> = ({ className, ...props }) => (
  <div className={`flex justify-end p-6 pt-0 gap-2 ${className}`} {...props} />
)

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
