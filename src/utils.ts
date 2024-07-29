interface DataObject {
    keywords: string;
}

export function transformData(data: DataObject[]): (string | number)[][] {
    // 获取所有可能的键
    const allKeys = new Set<string>();
    data.forEach(item => {
        item.keywords.split(',').forEach(pair => {
            const key = pair.split(':')[0];
            allKeys.add(key);
        });
    });

    // 将所有键转换为数组
    const headers = Array.from(allKeys);
    // 构建结果数组，首先是标题行
    const result: (string | number)[][] = [headers];

    // 遍历原始数据数组
    data.forEach(item => {
        // 初始化一行，默认为空字符串
        const row = headers.map(() => "");
        item.keywords.split(',').forEach(pair => {
            const [key, value] = pair.split(':');
            // 找到对应的键并设置对应的值
            const index = headers.indexOf(key);
            row[index] = value === undefined ? "" : isNaN(Number(value)) ? value : Number(value);
        });
        result.push(row);
    });

    return result;
}

