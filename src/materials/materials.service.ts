import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.material.findMany({ orderBy: { materialCode: 'asc' } });
  }

  async findOne(id: string) {
    const m = await this.prisma.material.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Material not found');
    return m;
  }

  async findByCode(code: string) {
    const m = await this.prisma.material.findUnique({ where: { materialCode: code } });
    if (!m) throw new NotFoundException('Material not found');
    return m;
  }

  async create(dto: { materialCode: string; materialName: string; unit: string; description?: string }) {
    const existing = await this.prisma.material.findUnique({ where: { materialCode: dto.materialCode } });
    if (existing) throw new ConflictException(`Material code ${dto.materialCode} already exists`);
    return this.prisma.material.create({ data: dto });
  }

  async update(id: string, dto: { materialName?: string; unit?: string; description?: string }) {
    await this.findOne(id);
    return this.prisma.material.update({ where: { id }, data: dto });
  }
}
