import attributes from './attributes.json';
import { NavbarLinksGroup } from './NavbarLinksGroup';
import { StoryWrapper } from './StoryWrapper';

export default { title: 'NavbarLinksGroup' };

export function Usage() {
  return <StoryWrapper attributes={attributes} component={NavbarLinksGroup} />;
}