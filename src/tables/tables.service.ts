import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Table, TableDocument, TableStatus } from './schemas/table.schema';
import {
  CreateTableDto,
  UpdateTableDto,
  CreateTablesDto,
} from './dto/table.dto';
import { toObjectId } from '../libs/config';

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
  ) {}

  /**
   * Calculates the default grid position for the next new table.
   * Pattern: (3,0), (6,0), (9,0), (12,0), then (3,3), (6,3)...
   * 4 columns per row, spaced 3 grid units apart.
   */
  private async calcDefaultPosition(
    restaurantId: string | Types.ObjectId,
  ): Promise<{ x: number; y: number }> {
    const rid = toObjectId(restaurantId);
    const COLS = 4;
    const STEP = 3;
    const count = await this.tableModel
      .countDocuments({ restaurantId: rid })
      .exec();
    const col = count % COLS;
    const row = Math.floor(count / COLS);
    return { x: (col + 1) * STEP, y: row * STEP };
  }

  async create(
    restaurantId: string | Types.ObjectId,
    tableData: CreateTableDto,
  ): Promise<TableDocument> {
    const rid = toObjectId(restaurantId);

    // Use caller-provided position if specified, otherwise auto-calculate
    const hasPosition =
      tableData.position ||
      tableData.x !== undefined ||
      tableData.y !== undefined;
    const position = hasPosition
      ? {
          x: tableData.x ?? tableData.position?.x ?? 0,
          y: tableData.y ?? tableData.position?.y ?? 0,
        }
      : await this.calcDefaultPosition(rid);

    const table = new this.tableModel({
      ...tableData,
      restaurantId: rid,
      section: tableData.section ? toObjectId(tableData.section) : undefined,
      displayName: tableData.displayName || tableData.name,
      position,
    });

    return table.save();
  }

  async createBatch(
    restaurantId: string | Types.ObjectId,
    tables: CreateTableDto[],
  ): Promise<TableDocument[]> {
    const rid = toObjectId(restaurantId);
    const tableDocs = tables.map((tableData) => {
      const position = {
        x: tableData.x !== undefined ? tableData.x : tableData.position?.x || 0,
        y: tableData.y !== undefined ? tableData.y : tableData.position?.y || 0,
      };

      return {
        ...tableData,
        restaurantId: rid,
        section: tableData.section ? toObjectId(tableData.section) : undefined,
        displayName: tableData.displayName || tableData.name,
        position,
      };
    });

    return this.tableModel.insertMany(tableDocs) as unknown as TableDocument[];
  }

  async findAll(
    restaurantId: string | Types.ObjectId,
  ): Promise<TableDocument[]> {
    const rid = toObjectId(restaurantId);
    return this.tableModel.find({ restaurantId: rid }).exec();
  }

  async findById(id: string | Types.ObjectId): Promise<TableDocument | null> {
    return this.tableModel.findById(toObjectId(id)).exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: UpdateTableDto,
  ): Promise<TableDocument | null> {
    const tid = toObjectId(id);
    const data = { ...updateData };
    if (data.section) data.section = toObjectId(data.section) as any;

    return this.tableModel.findByIdAndUpdate(tid, data, { new: true }).exec();
  }

  async updateStatus(
    id: string | Types.ObjectId,
    status: TableStatus,
    currentOrderId?: Types.ObjectId,
  ): Promise<TableDocument | null> {
    const updateObj: {
      status: TableStatus;
      currentOrderId?: Types.ObjectId | null;
    } = { status };
    if (status === TableStatus.AVAILABLE) {
      updateObj.currentOrderId = null;
    } else if (currentOrderId !== undefined) {
      updateObj.currentOrderId = currentOrderId;
    }

    return this.tableModel
      .findByIdAndUpdate(toObjectId(id), updateObj, { new: true })
      .exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.tableModel
      .findByIdAndDelete(toObjectId(id))
      .exec();
    return !!result;
  }

  async deleteAllByRestaurant(
    restaurantId: string | Types.ObjectId,
  ): Promise<number> {
    const rid = toObjectId(restaurantId);
    const result = await this.tableModel
      .deleteMany({ restaurantId: rid })
      .exec();
    return result.deletedCount;
  }
}
