import { useState } from 'react';

export const useSideMenu = () => {
  const [showMenu, setShowMenu] = useState(false);

  const openMenu = () => {
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  return {
    showMenu,
    openMenu,
    closeMenu
  };
};
