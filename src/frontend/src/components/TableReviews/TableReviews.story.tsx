import { StoryWrapper } from "../NavbarLinksGroup/StoryWrapper";

export default { title: 'TableReviews' };
import attributes from './attributes.json';
import { TableReviews } from "./TableReviews";

export function Usage() {
    return <StoryWrapper attributes={attributes} component={TableReviews} />;
}