import { Divider, Tooltip } from '@mui/material';
import { Menu, MenuItem, styled } from '@mui/material';
import { INavigationMenuItem } from 'interfaces/route';
import { Link } from 'react-router-dom';


interface INavigationMenuProps {
    options: INavigationMenuItem[];
    id: string;
    anchorEl: any;
    handleClose: () => void;
    style: Object;
}

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    alignItems: 'center',
    display: 'flex',
    color: 'inherit',
    height: '100%',
    width: '100%',
    '&&': {
        // Override MenuItem's built-in padding.
        padding: theme.spacing(1, 2),
    },
}));

const StyledSpan = styled('span')(({ theme }) => ({
    width: '12.5px',
    height: '12.5px',
    display: 'block',
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(2),
    borderRadius: '2px',
}));


export const NavigationMenu = ({
    options,
    id,
    handleClose,
    anchorEl,
    style,
}: INavigationMenuProps) => {

    

    return (
        <Menu
            id={id}
            onClose={handleClose}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            style={style}
        >
            {options
                .map((option, i) => {
                    const previousGroup = options[i - 1]?.group;
                    const addDivider =
                        previousGroup &&
                        previousGroup !== option.group &&
                        (option.group === 'log');

                    return [
                        addDivider ? (
                            <Divider variant="middle" key={option.group} />
                        ) : null,
                        <Tooltip
                            title={
                                ''
                            }
                            arrow
                            placement="left"
                            key={option.path}
                        >
                            <MenuItem
                                component={StyledLink}
                                to={option.path}
                                onClick={handleClose}
                            >
                                <StyledSpan />
                                {option.title}
                                
                            </MenuItem>
                        </Tooltip>,
                    ];
                })
                .flat()
                .filter(Boolean)}
        </Menu>
    );
};
