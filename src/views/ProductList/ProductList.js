import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { IconButton, Grid, Typography, Divider } from '@material-ui/core'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import { connect } from "react-redux"
import { loadApps, sendRequest } from "../../actions/appActions"
import { ProductsToolbar, ProductCard, ProductForm, ProductDetails } from './components'
import mockData from './data'
import PropTypes from 'prop-types'
import validate from 'validate.js'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2),
  },
  toolBar: {
    marginBottom: theme.spacing(3)
  },
  pagination: {
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  noApp: {
    marginBottom: '1em',
    color: 'gray',
    marginLeft: '25%'
  },
  section1: {
    marginBottom: '1em'
  }
}));

const schema = {
}


const ProductList = props => {
  const classes = useStyles();
  const [products] = useState(mockData)
  const { loadApps, sendRequest } = props
  const [appState, setAppState] = useState({
    apps: [],
    appsToShow: [],
    orgApps: [],
    orgAppsToShow: [],
    demandMode: false,
    detailMode: false,
    appSelected: {}
  })
  const [filterState, setFilterState] = useState({
    search: "",
    objectives: [],
    objective: "",
  })
  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {},
    learners: []
  })

  const handleChange = event => {
    event.persist();

    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true
      }
    }))
    console.log(formState.touched)
    console.log(formState)
  }

  const hasError = field =>
    formState.touched[field] && formState.errors[field] ? true : false;


  const handleRequestSubmit = (event) => {
    event.preventDefault()
    console.log("formState", formState)
    console.log("appState", appState)
    sendRequest(formState.values, props.user, appState.appSelected)
    setFormState((formState) => ({
      ...formState,
      values: {},
      touched: {},
      errors: {},
    }))
    setAppState((appState) => ({
      ...appState,
      demandMode: false,
      appSelected: {}
    }))
  }

  useEffect(() => {

    const errors = validate(formState.values, schema)
    setFormState((formState) => ({
      ...formState,
      errors: errors || {},
      isValid: errors ? false : true,
    }))
  }, [formState.values])

  useEffect(() => {
    loadApps()
  }, [])

  useEffect(() => {
    if (props.user != null) {
      console.log("props orgApps", props.user.organizations[0].apps)
      console.log("props apps", props.apps)
      let objectives = []
      for (let i = 0; i < props.apps.apps.length; i++) {
        console.log(props.apps.apps[i])
        let exercices = props.apps.apps[i].exercices
        for (let j = 0; j < exercices.length; j++) {
          objectives = [...objectives, ...exercices[j].goals]
          objectives = objectives.filter((val, id, array) => array.indexOf(val) == id)
        }
      }
      console.log("objs", objectives)
      setFilterState(prev => ({
        ...prev,
        objectives: objectives
      }))
      setAppState((appState) => {
        let apps = props.apps.apps
        if(props.user.organizations[0].apps) {
          apps = apps.filter(app => {
            return !props.user.organizations[0].apps.find(f => {
              return app._id === f._id
            })
          })
        }
        return {
          ...appState,
          apps: apps,
          appsToShow: props.apps.apps.filter(app => {
            return !props.user.organizations[0].apps.find(f => {
              return app._id === f._id
            })
          }),
          orgApps: props.user.organizations[0].apps,
          orgAppsToShow: props.user.organizations[0].apps,
          learners: props.user.organizations[0].learners,
        }
      })
    }
  }, [props.apps, props.user])

  const onDemandClick = (event) => {
    event.persist()
    console.log("ondemandeclicked")
    const id = event.target.parentElement.name
    const appSelected = appState.apps.filter(app => { return app._id === id })
    setAppState((appState) => ({
      ...appState,
      demandMode: true,
      appSelected: appSelected[0],
    }))
  }

  const handleSelectChange = (event) => {
    const name = event.target.name
    const value = event.target.value
    setFilterState({
      ...filterState,
      [name]: event.target.value,
    })
    setAppState(prev => {
      let appsToShow = []
      let orgAppsToShow = []
      if (value !== "") {
        for (let b = 0; b < prev.apps.length; b++) {
          let app = prev.apps[b]
          for (let i = 0; i < app.exercices.length; i++) {
            if (app.exercices[i].goals.includes(value)) {
              appsToShow.push(app)
              break
            }
          }
        }
        for (let a = 0; a < prev.orgApps.length; a++) {
          let app = prev.orgApps[a]
          for (let i = 0; i < app.exercices.length; i++) {
            if (app.exercices[i].goals.includes(value)) {
              console.log(app.name, app.exercices[i].goals)
              orgAppsToShow.push(app)
              break
            }
          }
        }
      } else {
        appsToShow = appState.apps
        orgAppsToShow = appState.orgApps
      }
      return {
        ...prev,
        appsToShow: appsToShow.filter(app => app.name.includes(filterState.search)),
        orgAppsToShow: orgAppsToShow.filter(app => app.name.includes(filterState.search))
      }
    })
  }

  const handleSearchChange = (event) => {
    const value = event.target.value
    console.log(value)
    setFilterState(prev => ({
      ...prev,
      search: value,
    }))
    setAppState(prev => {
      let appsToShow = []
      let orgAppsToShow = []
      console.log(filterState.objective)
      if (filterState.objective !== '') {
        for (let b = 0; b < prev.apps.length; b++) {
          let app = prev.apps[b]
          for (let i = 0; i < app.exercices.length; i++) {
            if (app.exercices[i].goals.includes(filterState.objective)) {
              appsToShow.push(app)
              break
            }
          }
        }
        for (let a = 0; a < prev.orgApps.length; a++) {
          let app = prev.orgApps[a]
          for (let i = 0; i < app.exercices.length; i++) {
            if (app.exercices[i].goals.includes(filterState.objective)) {
              console.log(app.name, app.exercices[i].goals)
              orgAppsToShow.push(app)
              break
            }
          }
        }
      } else {
        orgAppsToShow = prev.orgApps
        appsToShow = prev.apps
      }
      console.log(orgAppsToShow)
      return {
        ...prev,
        appsToShow: appsToShow.filter(app => app.name.includes(value)),
        orgAppsToShow: orgAppsToShow.filter(app => app.name.includes(value)),
      }
    })
  }

  const handleBack = () => {
    setAppState(prevState => ({
      ...prevState,
      detailMode: false,
      appSelected: {}
    }))
  }

  const onDetailClick = (event) => {
    event.persist()
    console.log('ondetailclicked')
    const id = event.target.parentElement.name
    console.log("apps", appState.apps)
    const [appSelected] = appState.orgApps.filter(app => app._id === id)
    console.log("ondetail click", appSelected)
    console.log("id", id)
    console.log("appselected", appSelected)
    setAppState((appState) => ({
      ...appState,
      detailMode: true,
      appSelected: appSelected
    }))
  }

  return (
    <div className={classes.root}>
      {appState.demandMode || appState.detailMode ? "" : <div className={classes.toolBar}>
        <ProductsToolbar
          filterState={filterState}
          handleSearchChange={handleSearchChange}
          handleSelectChange={handleSelectChange}
        />
      </div>}

      {appState.demandMode || appState.detailMode ?
        <div>
          {appState.demandMode ?
            <ProductForm
              handleChange={handleChange}
              hasError={hasError}
              formState={formState}
              handleRequestSubmit={handleRequestSubmit}
              learners={appState.learners}
            />
            :
            <ProductDetails app={appState.appSelected} handleBack={handleBack} />
          }
        </div>
        :
        <div>
          <div className={classes.section1}>
            <Typography variant="h3">Vos applications</Typography>
            {appState.orgAppsToShow.length !== 0 ?
              <div className={classes.content}>
                <Grid
                  container
                  spacing={3}
                >
                  {appState.orgAppsToShow.map(app => (
                    <Grid
                      item
                      key={app._id}
                      lg={4}
                      md={6}
                      xs={12}
                    >
                      <ProductCard product={app} type="orgApps" onDetailClick={onDetailClick} />
                    </Grid>
                  ))}
                </Grid>
              </div>
              :
              <Typography variant="h3" className={classes.noApp}>Aucune application à afficher</Typography>
            }
          </div>

          <Divider variant="middle" />

          <div className={classes.content}>
            <Typography variant="h3" className={classes.toolBar}>Applications non acquises</Typography>
            {appState.appsToShow.length ?
              <div>
                <Grid
                  container
                  spacing={3}
                >
                  {appState.appsToShow.map(app => (
                    <Grid
                      item
                      key={app._id}
                      lg={4}
                      md={6}
                      xs={12}
                    >
                      <ProductCard product={app} type="esapp" onDemandClick={onDemandClick} />
                    </Grid>
                  ))}
                </Grid>
              </div>
              :
              <Typography variant="h3" className={classes.noApp}>Aucune application à afficher</Typography>
            }
          </div>
        </div>}
    </div>
  );
};

const mapStateToProps = state => ({
  loadApps: PropTypes.func.isRequired,
  sendRequest: PropTypes.func.isRequired,
  apps: state.app,
  user: state.auth.user
})

export default connect(mapStateToProps, { loadApps, sendRequest })(ProductList);