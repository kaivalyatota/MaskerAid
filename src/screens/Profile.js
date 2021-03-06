import React, {Component} from 'react';
import {View, Text, StyleSheet, Image, Alert, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {withNavigation} from 'react-navigation';
import {PostFeed} from '../containers';
import {Button} from 'react-native-paper';
import Fire from '../util/Fire';
import {GlobalContext} from '../navigation/ContextProvider';
import firestore from '@react-native-firebase/firestore';
import {Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width;

class Profile extends Component {
  static data = PostFeed;
  static contextType = GlobalContext;

  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user ? Fire.sanitizeUser(this.props.user) : this.props.route.params.user,
      selfProfile: this.props.user ? true : false,
      following: false,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
    };
  }

  updateFollowState = () => {
    const {user} = this.context;

    // Retrieve following state
    firestore()
      .collection('users')
      .where('uid', '==', user.uid)
      .where('_following', 'array-contains', this.state.user.uid)
      .get()
      .then(
        function (querySnapshot) {
          this.setState({following: !querySnapshot.empty});
        }.bind(this),
      )
      .catch(function (error) {
        console.log('Error getting documents: ', error);
      });
  };

  componentDidMount() {
    // If this isn't the own user's profile
    if (!this.state.selfProfile) {
      this.updateFollowState();
    }

    // Retrieve follower/following count
    this.unsubscribe = firestore()
      .collection('users')
      .doc(this.state.user.uid)
      .onSnapshot((snapshot) => {
        if (snapshot.data()) {
          this.setState({
            followerCount:
              snapshot.data().follower_count && snapshot.data().follower_count >= 0
                ? snapshot.data().follower_count
                : 0,
            followingCount:
              snapshot.data().following_count && snapshot.data().following_count >= 0
                ? snapshot.data().following_count
                : 0,
            postCount: snapshot.data().post_count && snapshot.data().post_count >= 0 ? snapshot.data().post_count : 0,
          });
        }
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  renderHeader = () => {
    const {theme} = this.context;
    return (
      <>
        <View style={{backgroundColor: 'white'}}>
          <View>
            {this.renderTopBar()}
            <Image
              style={{
                alignSelf: 'center',
                width: 125,
                height: 125,
                marginTop: 20,
                borderRadius: 75,
                borderWidth: 1,
                borderColor: theme.colors.primary,
              }}
              source={{uri: this.state.user.photoURL}}
              resizeMode="stretch"
            />
            <Text style={styles.userName}>{this.state.user.displayName}</Text>
          </View>
          <View
            style={{
              marginBottom: 20,
              backgroundColor: 'white',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}>
            <View style={{alignItems: 'center'}}>
              <Text style={styles.userStatus}>{this.state.postCount}</Text>
              <Text>Posts</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.push('UserList', {
                    user: this.state.user,
                    listType: 'following',
                  });
                }}>
                <Text style={styles.userStatus}>{this.state.followingCount}</Text>
                <Text>Following</Text>
              </TouchableOpacity>
            </View>
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.push('UserList', {
                    user: this.state.user,
                    listType: 'followers',
                  });
                }}>
                <Text style={styles.userStatus}>{this.state.followerCount}</Text>
                <Text>Followers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View stle={{backgroundColor: 'white'}}>
          <View
            style={{
              backgroundColor: 'white',
              flexDirection: 'row',
              borderTopWidth: 0.75,
              borderTopColor: 'black',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name={'ios-list'} size={30} style={{color: theme.colors.primary}} />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 20,
                color: theme.colors.primary,
              }}>
              Posts
            </Text>
          </View>
        </View>
      </>
    );
  };

  renderTopBar = () => {
    const {user, logout, deleteAccount, theme} = this.context;
    if (this.state.selfProfile) {
      return (
        <>
          <View style={{flexDirection: 'row'}}>
            <Button
              style={{width: screenWidth / 3.45, height: 35}}
              icon="brush"
              mode="contained"
              onPress={() => {
                this.props.navigation.navigate('Settings');
              }}>
              Theme
            </Button>
            <Button
              style={{width: screenWidth / 3.88, height: 35}}
              icon="logout"
              mode="contained"
              onPress={() => {
                Alert.alert(
                  'Are you sure you want to logout?',
                  'All your posts will be saved!',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'OK', onPress: () => logout()},
                  ],
                  {cancelable: false},
                );
              }}>
              Logout
            </Button>
            <Button
              style={{width: screenWidth / 2.19, height: 35}}
              icon="trash-can-outline"
              mode="contained"
              onPress={() => {
                Alert.alert(
                  'Are you sure you want to delete your account?',
                  "There's no turning back!",
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'OK', onPress: () => deleteAccount()},
                  ],
                  {cancelable: false},
                );
              }}>
              Delete Account
            </Button>
          </View>
        </>
      );
    } else if (user.uid != this.state.user.uid) {
      return (
        <>
          <View style={{backgroundColor: 'white', flexDirection: 'row'}}>
            <Button
              style={{
                backgroundColor: theme.colors.primary,
                width: screenWidth / 2,
              }}
              icon="logout"
              mode="contained"
              onPress={() => {
                Fire.setFollowing(user, this.state.user, !this.state.following);
                this.updateFollowState();
              }}>
              {this.state.following ? 'Unfollow' : 'Follow'}
            </Button>
            <Button
              style={{
                backgroundColor: theme.colors.primary,
                width: screenWidth / 2,
              }}
              icon="logout"
              mode="contained"
              onPress={() => {
                this.props.navigation.navigate('Chat', {
                  user: {
                    uid: this.state.user.uid,
                    photoURL: this.state.user.photoURL,
                    email: this.state.user.email,
                    displayName: this.state.user.displayName,
                  },
                });
              }}>
              Message
            </Button>
          </View>
        </>
      );
    }
  };

  render() {
    return (
      <PostFeed
        user={this.state.user}
        navigation={this.props.navigation}
        onHeader={() => {
          return this.renderHeader();
        }}
      />
    );
  }
}

export default withNavigation(Profile);

const styles = StyleSheet.create({
  userName: {
    alignSelf: 'center',
    fontSize: 25,
    marginTop: 15,
    marginBottom: 20,
  },

  userStatus: {
    alignSelf: 'center',
    fontSize: 20,
  },
});
