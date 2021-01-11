const sharedTheme = (theme) => ({
    boxDialpad: {
      marginTop: theme.spacing.unit * 5, 
      marginBottom: theme.spacing.unit * 5,
      paddingTop: theme.spacing.unit * 5, 
      borderTop: '1px solid #eeeeee',
      width: '100%' 
    },  
    titleAgentDialpad: {
      width: '100%',
      textTransform: 'uppercase',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: theme.typography.fontSize
    }
  })
  
export default sharedTheme