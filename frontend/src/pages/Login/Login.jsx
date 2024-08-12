import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Paper, Avatar, TextField, Button, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
import { Grid } from '@mui/material';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
    label: {
        color: 'rgb(117, 40, 136)',
      },
  root: {
    '& label.Mui-focused': {
      color: 'rgb(117, 40, 136)',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'rgb(117, 40, 136)',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgb(117, 40, 136)',
      },
      '&:hover fieldset': {
        borderColor: 'rgb(117, 40, 136)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'rgb(117, 40, 136)',
      },
    },
  },
});

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const classes = useStyles();
    const paperStyle = {
        padding: 20,
        height: '50vh',
        width: '80%',
        maxWidth: 350,
        margin: "0 auto",
        borderRadius: '15px',
        textAlign: 'center',
        backgroundColor: 'white',
    }
    const avatarStyle = { backgroundColor: 'rgba(218, 188, 225)' }
    const btnstyle = { margin: '8px 0' }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/users/login', { email, password });
            sessionStorage.setItem('user', JSON.stringify(res.data.user));
            sessionStorage.setItem('token', res.data.token);
            switch (res.data.user.role) {
                case 'admin':
                    navigate('/ehome');
                    break;
                case 'employee':
                    navigate('/ehome');
                    break;
                case 'customer':
                    navigate('/customerhome');
                    break;
                case 'superadmin':
                    navigate('/home');
                    break;
                default:
                    throw new Error('Role not recognized');
            }
        } catch (err) {
            console.error(err);
            alert('Password not matched!');
        }
    }

    return (
        <Grid container style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(218, 188, 225)' }}>
            <Paper elevation={10} style={paperStyle}>
                <form onSubmit={handleSubmit}>
                    <Grid align='center'>
                        <Avatar style={avatarStyle}><LockOutlinedIcon /></Avatar>
                        <h2 style={{ color: 'rgb(117, 40, 136)' }}>Sign In</h2>
                    </Grid>
                    <TextField className={classes.root} label='Email' placeholder='Enter email' fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField className={classes.root} label='Password' placeholder='Enter password' type='password' fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="checkedB"
                                style={{ color: 'rgb(117, 40, 136)' }}
                            />
                        }
                        label="Remember me"
                        style={{ color: 'rgb(0, 0, 0)' }}
                    />
                    <Button
                        type='submit'
                        variant="contained"
                        style={{ ...btnstyle, backgroundColor: 'rgb(117, 40, 136)', color: 'rgb(224, 206, 229)' }}
                        fullWidth
                    >
                        Sign in
                    </Button>
                    <Link to="/forget_password" style={{ color: 'rgb(117, 40, 136)' }}>
                    <Typography style={{ color: 'rgb(117, 40, 136)' }}>
                            Forgot password?
                    </Typography>
                    </Link>
                </form>
            </Paper>
        </Grid>
    )
}
