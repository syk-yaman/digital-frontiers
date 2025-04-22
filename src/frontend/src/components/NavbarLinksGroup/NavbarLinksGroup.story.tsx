import attributes from './attributes.json';
import { LinksGroup } from './NavbarLinksGroup';
import { StoryWrapper } from './StoryWrapper';

export default { title: 'NavbarLinksGroup' };

export function Usage() {
  return <StoryWrapper attributes={attributes} component={LinksGroup} />;
}