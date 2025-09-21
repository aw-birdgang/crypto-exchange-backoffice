import {Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Request, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AuthService} from '../application/services/auth.service';
import {AuthResponseDto, LoginDto, RefreshResponseDto, RefreshTokenDto, RegisterDto} from '../application/dto/auth.dto';
import {Public} from '../application/decorators/public.decorator';
import {ApiBodyHelpers} from './constants/api-body.constants';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {PermissionService} from '../application/services/permission.service';
import {CurrentUser, RequestId, ApiVersion} from '../../../common/decorators';
import {AdminUser} from '../domain/entities/admin-user.entity';
import {ParseBooleanPipe, ParseIntPipe, ParseUuidPipe, TrimPipe, CustomValidationPipe} from '../../../common/pipes';
import {AuthSwagger} from './swagger/auth.swagger';

@ApiTags('Authentication')
@Controller('auth')
@ApiVersion('v1')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionService: PermissionService,
  ) {}

  @Post('register')
  @Public()
  @ApiBodyHelpers.register()
  @AuthSwagger.register()
  async register(@Body(TrimPipe, CustomValidationPipe) registerDto: RegisterDto): Promise<{ message: string; userId: string }> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBodyHelpers.login()
  @AuthSwagger.login()
  async login(@Body(TrimPipe, CustomValidationPipe) loginDto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);
    return result;
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBodyHelpers.refreshToken()
  @AuthSwagger.refresh()
  async refresh(@Body(TrimPipe, CustomValidationPipe) refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @AuthSwagger.logout()
  async logout(@Request() req: any): Promise<{ message: string }> {
    console.log('🚪 User logged out');

    // 개발 환경에서 쿠키 정리
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing cookies in development mode');
    }

    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @AuthSwagger.getProfile()
  async getProfile(@CurrentUser() user: AdminUser, @RequestId() requestId: string) {
    console.log('🔍 AuthController: getProfile called with requestId:', requestId);
    console.log('🔍 AuthController: Current user:', user);

    // Service에서 이미 매핑된 결과를 받아옴
    const profile = await this.authService.getUserProfile(user.id);

    console.log('✅ AuthController: Profile data:', profile);
    return profile;
  }

  @Get('my-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @AuthSwagger.getMyRole()
  async getMyRole(@CurrentUser() user: AdminUser, @RequestId() requestId: string) {
    console.log('🔍 AuthController: getMyRole called with requestId:', requestId);
    console.log('🔍 AuthController: Current user:', user);

    const role = await this.authService.getMyRole(user);
    console.log('🔍 AuthController: Found role:', role);

    return role;
  }

  @Get('my-role-id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @AuthSwagger.getMyRoleId()
  async getMyRoleId(@CurrentUser() user: AdminUser, @RequestId() requestId: string) {
    console.log('🔍 AuthController: getMyRoleId called with requestId:', requestId);
    console.log('🔍 AuthController: Current user:', user);
    const result = await this.authService.getUserRoleId(user);
    console.log('✅ AuthController: Role ID result:', result);
    return result;
  }

  @Get('test-pipes/:id')
  @Public()
  @AuthSwagger.testPipes()
  async testPipes(
    @Param('id', ParseIntPipe) id: number,
    @Query('uuid', ParseUuidPipe) uuid: string,
    @Query('boolean', ParseBooleanPipe) boolean: boolean,
    @Query('text', TrimPipe) text: string,
    @RequestId() requestId: string,
  ) {
    return {
      message: 'Pipes test successful',
      parsedId: id,
      parsedUuid: uuid,
      parsedBoolean: boolean,
      trimmedText: text,
      requestId,
      timestamp: new Date().toISOString()
    };
  }
}
