import {
	IsString,
	IsNumber,
	IsOptional,
	IsArray,
	ValidateNested,
	IsEmail,
	Min,
	IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";

export class ProductDetailDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNumber()
	@Min(1)
	quantity: number;

	@IsNumber()
	@Min(0)
	unitPrice: number;
}

export class CustomerDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsEmail()
	email: string;
}

export class CreateOrderDto {
	@ValidateNested()
	@Type(() => CustomerDto)
	customer: CustomerDto;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ProductDetailDto)
	productDetails: ProductDetailDto[];

	@IsString()
	@IsOptional()
	notes?: string;
}
