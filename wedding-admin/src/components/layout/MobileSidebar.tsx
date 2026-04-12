import { Drawer } from 'antd';
import { useUIStore } from '../../store/ui.store';
import Sidebar from './Sidebar';

export default function MobileSidebar() {
  const open = useUIStore((s) => s.mobileSidebarOpen);
  const setOpen = useUIStore((s) => s.setMobileSidebar);

  return (
    <Drawer
      placement="left"
      open={open}
      onClose={() => setOpen(false)}
      width={260}
      styles={{ body: { padding: 0 } }}
      closable={false}
    >
      <div onClick={() => setOpen(false)} style={{ height: '100%' }}>
        <Sidebar />
      </div>
    </Drawer>
  );
}
