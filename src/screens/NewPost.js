import {
  Dialog,
  Portal,
  Button,
  Paragraph,
  ProgressBar,
  ActivityIndicator,
  DefaultTheme,
  TextInput,
} from 'react-native-paper';
import {Image, View, Text, KeyboardAvoidingView, ScrollView} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import Snackbar from 'react-native-snackbar';
import {useUpload} from '../util';
import VideoMedia from '../presentation/VideoMedia';
import {GlobalContext} from '../navigation/ContextProvider';

function NewPost({navigation}) {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [response, setResponse] = useState(null);
  const [postDialogVisible, setPostDialogVisible] = useState(false);
  const [prompt, setPrompt] = useState(true);
  const [{success, uploading}, monitorUpload] = useUpload();
  const [isVideo, setVideo] = useState(false);
  const {theme} = useContext(GlobalContext);

  const uploadFile = () => {
    if (response) {
      monitorUpload(response, title);
      setPrompt(true);
      setResponse(null);
    }
  };

  useEffect(() => {
    if (success && prompt) {
      setPrompt(false);
      setImage(null);
      setTitle('');
      Snackbar.show({
        text: 'Posted!',
        duration: Snackbar.LENGTH_LONG,
        action: {
          text: 'Go Home',
          textColor: theme.colors.primary,
          onPress: () => {
            navigation.navigate('Home');
          },
        },
      });
    }
  });

  const takeImage = () => {
    ImagePicker.openCamera({
      width: 1000,
      height: 1000,
      maxFiles: 1,
      forceJpg: true,
      cropping: true,
    })
      .then((image) => {
        setResponse(image);
        setImage({uri: image.path});
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const takeVideo = () => {
    ImagePicker.openCamera({
      width: 1000,
      height: 1000,
      maxFiles: 1,
      mediaType: 'video',
      compressVideoPreset: 'MediumQuality',
    })
      .then((image) => {
        setResponse(image);
        setImage({uri: image.path});
        if (image.mime == 'video/mp4') {
          setVideo(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 1000,
      height: 1000,
      maxFiles: 1,
      forceJpg: true,
      cropping: true,
    })
      .then((image) => {
        setResponse(image);
        setImage({uri: image.path});
        if (image.mime == 'video/mp4') {
          setVideo(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const selectVideo = () => {
    ImagePicker.openPicker({
      maxFiles: 1,
      mediaType: 'video',
      compressVideoPreset: 'MediumQuality',
    })
      .then((image) => {
        setResponse(image);
        setImage({uri: image.path});
        if (image.mime == 'video/mp4') {
          setVideo(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const postView = () => {
    if (image) {
      return (
        <>
          {isVideo ? <VideoMedia source={image.uri} /> : <Image source={image} style={{width: '100%', height: 300}} />}
          <Button
            icon="trash-can"
            mode="contained"
            onPress={() => setImage(null)}
            style={{
              alignItems: 'center',
              padding: 10,
              margin: 30,
            }}>
            Clear Media
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            icon="camera"
            mode="contained"
            onPress={() => takeImage()}
            style={{
              alignItems: 'center',
              padding: 10,
              margin: 30,
            }}>
            Take Photo
          </Button>
          <Button
            icon="video"
            mode="contained"
            onPress={() => takeVideo()}
            style={{
              alignItems: 'center',
              padding: 10,
              margin: 30,
            }}>
            Take Video
          </Button>
          <Button
            icon="camera"
            mode="contained"
            onPress={() => selectImage()}
            style={{
              alignItems: 'center',
              padding: 10,
              margin: 30,
            }}>
            Open Photo from Camera Roll
          </Button>
          <Button
            icon="video"
            mode="contained"
            onPress={() => selectVideo()}
            style={{
              alignItems: 'center',
              padding: 10,
              margin: 30,
            }}>
            Open Video from Camera Roll
          </Button>
        </>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      behavior="padding"
      enabled
      keyboardVerticalOffset={75}>
      <ScrollView>
        <View>{postView()}</View>
        <View style={{marginTop: 20, alignItems: 'center'}}>
          <Text>Post Caption</Text>
          <TextInput
            mode="outlined"
            placeholder="Enter a caption (Required)"
            style={{margin: 20, width: 300, color: 'green'}}
            theme={DefaultTheme}
            value={title}
            defaultValue="Default Value"
            clearButtonMode="while-editing"
            onChangeText={(text) => setTitle(text)}
          />
          {uploading ? (
            <ProgressBar progress={0.5} color={theme.colors.primary} />
          ) : (
            <Button
              mode="contained"
              disabled={image == null}
              onPress={() => {
                if (title != '') {
                  setPostDialogVisible(true);
                } else {
                  Snackbar.show({
                    text: 'You must enter a caption!',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'Dismiss',
                      textColor: theme.colors.primary,
                      onPress: () => {},
                    },
                  });
                }
              }}
              style={{
                alignItems: 'center',
                padding: 10,
                margin: 30,
              }}>
              Add Post
            </Button>
          )}
        </View>
        <Portal>
          <Dialog
            style={{backgroundColor: 'white'}}
            visible={postDialogVisible}
            onDismiss={() => {
              setPostDialogVisible(false);
            }}>
            <Dialog.Title>Are you sure you want to post?</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Is this a photo of a mask?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setPostDialogVisible(false)}>Cancel</Button>
              <Button
                onPress={() => {
                  uploadFile();
                  setPostDialogVisible(false);
                }}>
                Yes!
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <ActivityIndicator size="large" animating={uploading} color={theme.colors.primary} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default NewPost;
