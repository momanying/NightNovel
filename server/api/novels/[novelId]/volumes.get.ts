import { VolumeModel } from '~/server/models'

export default defineEventHandler(async (event) => {
  try {
    const novelId = event.context.params?.novelId;

    if (!novelId) {
      return {
        code: 400,
        message: '小说ID不能为空'
      };
    }

    // 获取卷列表，可以按需 populate 少量章节信息或不 populate
    const volumes = await VolumeModel.find({ novelId })
      .sort({ order: 1 })
      // 示例：如果每卷需要显示最新章节标题，可以做轻量级 populate
      // .populate({
      //   path: 'chapters',
      //   select: 'title order',
      //   options: { sort: { order: -1 }, limit: 1 } // 获取每卷最新1章
      // })
      // 或者完全不 populate，章节通过另一接口加载
      .select('_id title order novelId'); // 选择需要的字段

    if (!volumes || volumes.length === 0) {
      // 即使小说存在，也可能没有卷册信息
      // return {
      //   code: 404,
      //   message: '未找到该小说的卷册信息'
      // };
    }

    return {
      code: 200,
      message: '获取卷列表成功',
      data: volumes
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('获取卷列表失败:', err);
    return {
      code: 500,
      message: '获取卷列表失败',
      error: err.message
    };
  }
}); 