import { IsString, IsOptional, IsObject } from "class-validator";

export class TransitionOrderDto {
	@IsString()
	action: string;

	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>;
}
