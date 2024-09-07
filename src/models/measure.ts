import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/sequelize';

class Measure extends Model {
    image_url: any;
    measure_value: any;
    measure_uuid: any;
}

Measure.init({
  measure_uuid: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  customer_code: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  measure_datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  measure_type: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  measure_value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  has_confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Measure',
  tableName: 'Measure',
  timestamps: true,
});

export default Measure;
