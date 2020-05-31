import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Button } from '@material-ui/core';

import { SearchInput } from 'components';

const useStyles = makeStyles(theme => ({
  root: {},
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  }
}));

const UsersToolbar = props => {
  const { className, onClickAdd, addMode, ...rest } = props;

  const classes = useStyles();

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <div className={classes.row}>
        <span className={classes.spacer} />
        <Button className={classes.importButton}>Importer</Button>
        <Button className={classes.exportButton}>Exporter</Button>
        <Button
          color="primary"
          variant="contained"
          onClick={onClickAdd}
        >
          Ajouter un apprenti
        </Button>
      </div>
      <div className={classes.row}>
        {addMode ? null : <SearchInput
          className={classes.searchInput}
          placeholder="Trouver un apprenti"
        />}
      </div>
    </div>
  );
};

UsersToolbar.propTypes = {
  className: PropTypes.string,
  addMode : PropTypes.bool,
  onClickAdd: PropTypes.func.isRequired
};

export default UsersToolbar;
