import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

@Injectable()
export class TeacherApprovedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const method = request.method?.toUpperCase()
    const user = request.user

    if (!user?.teacherProfile) {
      throw new ForbiddenException('Teacher profile not found')
    }

    if (method === 'GET') {
      return true
    }

    const status = user.teacherProfile.status
    if (status !== 'APPROVED') {
      throw new ForbiddenException(
        status === 'PENDING_REVIEW'
          ? 'บัญชีครูของคุณยังรอการอนุมัติจากผู้ดูแลระบบ'
          : 'บัญชีครูของคุณไม่สามารถดำเนินการนี้ได้',
      )
    }

    return true
  }
}
