import { NovelModel } from '~/server/models';

export default defineEventHandler(async () => {
  try {
    const newNovels = await NovelModel.aggregate([
      {
        $addFields: {
          // 从 cover_url 中提取倒数第二个路径部分作为排序依据
          // 例如 "http://img.wenku8.com/image/1/1582/1582s.jpg" -> "1582"
          coverUrlOrderPartString: {
            $let: {
              vars: {
                urlParts: { $split: ["$cover_url", "/"] }
              },
              in: {
                // 获取倒数第二个元素 (size - 2)
                // 添加条件检查数组长度，防止urlParts长度小于2时出错
                $cond: {
                  if: { $gte: [{ $size: "$$urlParts" }, 2] },
                  then: { $arrayElemAt: ["$$urlParts", { $subtract: [{ $size: "$$urlParts" }, 2] }] },
                  else: null // 如果数组部分少于2，则此部分为null
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          // 将提取的字符串转换为整数
          // 如果转换失败或原始值为 null，则默认为 0
          coverUrlOrder: {
            $convert: {
              input: "$coverUrlOrderPartString",
              to: "int",
              onError: 0, // 如果转换出错，返回0
              onNull: 0   // 如果输入为null，返回0
            }
          }
        }
      },
      {
        $sort: { coverUrlOrder: -1 } // 按提取的数字倒序排序
      },
      {
        $limit: 10 // 根据文件当前设置，获取10本
      },
      {
        $project: { // 排除不需要的字段和临时字段
          volumes: 0,
          introduction: 0,
          coverUrlOrderPartString: 0, // 移除临时字段
          coverUrlOrder: 0            // 移除临时字段
        }
      }
    ]);
    
    return {
      status: 'success',
      data: newNovels
    };
  } catch (error) {
    console.error('获取新书失败:', error);
    return {
      status: 'error',
      message: '获取新书失败'
    };
  }
}); 