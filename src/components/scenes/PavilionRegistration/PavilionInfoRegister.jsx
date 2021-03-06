import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications'
import { useForm } from "react-hook-form";
import { withFirebase } from '../../../utils/Firebase';
import Input from '../../atoms/Input';
import Textarea from '../../atoms/Textarea';
import Button from '../../atoms/Button';
import { navigate } from 'gatsby';
import { PAVILION_DETAIL_REGISTER } from '../../../constants/routes'
import RegistrationStatus from '../../../constants/registrationStatus'
import Loading from '../../atoms/Loading'

const PavilionInfoRegister = ({
  firebase,
}) => {

  const { addToast } = useToasts()
  const [loading, setLoading] = useState(true);

  const { handleSubmit, register, errors, control } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const [_initFirebase, setInitFirebase] = useState(false)

  useEffect(() => {
    if (firebase && !_initFirebase) {
      setInitFirebase(true)
      setLoading(false)
    }
  }, [firebase])

  const onSubmit = async (value, e) => {
    try {
      e.preventDefault();

      await setLoading(true)
      await firebase.savePavilionBasicInfo(value, firebase.getCurrentUserId())
      await firebase.updateUser(firebase.getCurrentUserId(), { registrationStatus: RegistrationStatus.FINISHED_BASIC })
      await addToast('Successfully submitted!', { appearance: 'success' })
      navigate(PAVILION_DETAIL_REGISTER)
    } catch (error) {
      console.log(error)
      await addToast(`${error.message}, ${JSON.stringify(value)}`, { appearance: 'error', autoDismiss: false })
      await setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="home container">
         <Loading />
      </div>
    )
  }

  return(
    <div className="home container">

      <div className="home__intro">
        <p className="home__intro__text">
          Welcome to Bangkok Biennial 2020’s Pavilion Platform! 
          To register your pavilion to be a part of BB2020 (Bangkok Biennial 2020) 
          please provide the information and materials on this page and the next page. 
          The information on this page cannot be changed later 
          (or only in special circumstances and only by contacting the BB Team admins) 
          and will be used publicly in the lead-up to the Bangkok Biennial in December. 
          The information on the following page (after you press ‘submit’ on this page) 
          will later be used to create a page for your pavilion. 
          Once this page becomes available, you will be able to edit the information at any time. 
          Please provide the following information and then press “submit” to continue 
          to the next step in registration.
        </p>        
        <p className="home__intro__text">
          Please be aware that the Bangkok Biennial is run 100% by artist-volunteers and as such, 
          it can take some time to process information and build this open-source platform, 
          which is still being developed even as we open it to the public.
        </p>
      </div>


      <div className="home__details">
        <h1 className="home__title">Register Form</h1>
      </div>

      <div className="home__register">
        <div className="home__register__form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="home__register__form__title">The Pavillion</div>
            <Input
              name="pavilionName"
              type="text" 
              labelName="Name of Pavillion"
              reference={
                register({
                  required: "This field is required",
                })
              }
              required
              errors={errors}
            />

            <Textarea
              name="pavilionBriefDescription"
              type="text"
              labelName="Brief description of the pavilion (maximum 250 characters)"
              required
              reference={
                register({
                  required: "This field is required",
                  maxLength: {
                    value: 250,
                    message: "messages is exceed 250 lengths"
                  }
                })
              }
              errors={errors}
              rows={5}
              cols={100}
            />

            <Textarea
              name="listOfArtistsAndCurators"
              type="text"
              labelName="List of artists and curators (draft)"
              required
              reference={
                register({
                  required: "This field is required",
                })
              }
              errors={errors}
              rows={8}
              cols={100}
            />

            <Button type="submit">submit</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default withFirebase(PavilionInfoRegister)
