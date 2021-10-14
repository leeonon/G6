import { DisplayObject as Shape } from '@antv/g';
import { Rect, Circle, Ellipse, Polygon, Path, Image, Line, Text } from '@antv/g';

// 内容见 https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#Z8ZDU

// ● 继承新 G 所有内容
// ● getMatrix  同 Group
// ● setMatrix/applyMatrix  同 Group
// ● getBBox  同 Group
// ● getCanvasBBox  同 Group
// ● animate  同 Group

// Rect, Circle, Ellipse, Polygon, Path, Image, Line, Text 这些图形都继承上述内容
// 看情况是否要全部改写，需要的话建一个文件夹包裹所有 shape 相关文件

export default Shape;