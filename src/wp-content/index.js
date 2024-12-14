// Import XML files as raw text
import postXml from '../Elementor Kit Template/wp-content/post/post.xml?raw';
import pageXml from '../Elementor Kit Template/wp-content/page/page.xml?raw';
import navMenuXml from '../Elementor Kit Template/wp-content/nav_menu_item/nav_menu_item.xml?raw';

// Export XML content
export const wpContent = {
  'post/post.xml': postXml,
  'page/page.xml': pageXml,
  'nav_menu_item/nav_menu_item.xml': navMenuXml
};