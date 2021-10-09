import * as React from "react";
import "./MemberList.scss";
import UserInterfaceClassName from "../constants/UserInterfaceClassName";
import RepositoryMember from "../../../ts/simpleRepository/types/RepositoryMember";
import { map } from "../../../ts/modules/lodash";

export interface MemberListProps {
    readonly className ?: string;
    readonly list       : RepositoryMember[];
}

export interface MemberListState {
}

export class MemberList extends React.Component<MemberListProps, MemberListState> {

    public static defaultProps: Partial<MemberListProps> = {};

    public constructor (props: MemberListProps) {
        super(props);
    }

    public render () {

        const list : RepositoryMember[] = this.props?.list ?? [];

        if (list.length === 0) {
            return (
                <div className={UserInterfaceClassName.MEMBER_LIST + ' ' + (this.props.className ?? '')}>
                    No members.
                </div>
            );
        }

        return (
            <div className={UserInterfaceClassName.MEMBER_LIST + ' ' + (this.props.className ?? '')}>{
                map(list, (item : RepositoryMember, index: number) : any => {
                    const id = item.id;
                    const displayName = item?.displayName ?? id;
                    return (
                        <div key={`member-${id}`}
                             className={
                                 UserInterfaceClassName.MEMBER_LIST + '-member'
                                 + ' ' + UserInterfaceClassName.MEMBER_LIST + `-member-${ index %2 === 1 ? 'even' : 'odd' }`
                             }
                        >
                            <div className={UserInterfaceClassName.MEMBER_LIST + '-member-name'}>{displayName}</div>
                            <div className={UserInterfaceClassName.MEMBER_LIST + '-member-id'}>{id}</div>
                        </div>
                    );
                })
            }</div>
        );

    }

}

export default MemberList;
