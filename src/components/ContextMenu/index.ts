/**
 * 右键菜单
 */

export { createContextMenu, destroyContextMenu } from './src/createContextMenu';

export * from './src/typing';

// 示例
// <a-button type="primary" @contextmenu="handleMultipleContext"> Right Click on me </a-button>
// import { useContextMenu } from '@/hooks/web/useContextMenu';
// const [createContextMenu] = useContextMenu();
// function handleMultipleContext(e: MouseEvent) {
//   createContextMenu({
//     event: e,
//     items: [
//       {
//         label: '一级菜单',
//         icon: 'bi:plus',
//         children: [
//           {
//             label: '二级菜单1',
//             icon: 'bi:plus',
//             divider: true,
//             children: [
//               {
//                 label: '三级菜单1',
//                 handler: () => {
//                   console.log('click me')
//                 },
//               },
//               {
//                 label: '三级菜单2',
//                 disabled: true,
//               },
//             ],
//           },
//           {
//             label: '二级菜单2',
//             icon: 'bx:bxs-folder-open',
//           },
//         ],
//       },
//     ],
//   });
// }
