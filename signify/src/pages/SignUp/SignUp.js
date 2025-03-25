import classNames from 'classnames/bind';
import { Button } from 'antd';
import styles from './SignUp.module.scss'

const cx = classNames.bind(styles);
function SingUp() {
    return (
        <div className={styles.wrap}>
            <div className={cx(styles.contain)}>
                <label className={cx(styles.title)}>SingUp</label>
                <img src='https://kzmgtc0ckt3takuurghg.lite.vusercontent.net/placeholder.svg?height=100&width=100'></img>
                <div className={cx(styles.input)}>
                    <label>Name</label>
                    <input placeholder='Enter Name' type='text'></input>
                </div>
                <div className={cx(styles.input)}>
                    <label>Email</label>
                    <input placeholder='Enter Email' type='email'></input>
                </div>
                <div className={cx(styles.input)}>
                    <label>Password</label>
                    <input placeholder='Enter Password' type='password'></input>
                </div>
                <Button
                    className={cx(styles.button)}
                >Sign Up</Button>
            </div>
        </div>
    );
}

export default SingUp;
